// Copyright 2015 ArchiveLabs, et al.
// MIT Licensed?

var crypto = require("crypto");

var sln = require("./sln-client");

var TYPE = "text/vnd.tododav.item; charset=utf-8";

var repo = sln.createRepo("/", null);

// TODO: Use a real... JavaScript framework?
function clone(id, childByID) {
	var element = document.getElementById(id).cloneNode(true);
	//element.id = "";
	element.removeAttribute("id");
	if (childByID)
		(function findIDsInElement(elem) {
			var children = elem.childNodes, length = children.length, i = 0, dataID;
			if (elem.getAttribute)
				dataID = elem.getAttribute("data-id");
			if (dataID)
				childByID[dataID] = elem;
			for (; i < length; ++i)
				findIDsInElement(children[i]);
		})(element);
	return element;
}

function Item(parentURI, content) {
	var item = this;
	item.parentURI = parentURI;
	item.content = content;
	item.internal = {};
	item.element = clone("item", item.internal);
	item.internal.content.appendChild(document.createTextNode(item.content));
	item.internal.checkbox.onclick = function() {
		item.setState(this.checked, function(err) {
			console.log(err);
		});
	};
}
Item.prototype.format = function() {
	var item = this;
	return (item.parentURI||"")+"\r\n\r\n"+item.content;
};
Item.prototype.getURI = function() {
	var item = this;
	var sha256 = crypto.createHash("sha256");
	sha256.write(item.format(), "utf8");
	sha256.end();
	return "hash://sha256/"+sha256.read().toString("hex");
};
function flagstate(crdt) {
	var updates = crdt ? Object.keys(crdt) : [];
	updates.sort(); // Lexicographic sort.
	for(var i = updates.length; i-- > 0;) {
		if(/\d{20}/.test(updates[i])) return updates[i];
	}
	return new Array(20+1).join("0");
}
function flaginc(flag) {
	var digits = flag.split("").map(function(x) { return parseInt(x, 10); });
	for(var i = digits.length; i-- > 0;) {
		if(digits[i] < 9) {
			digits[i]++;
			return digits.map(function(x) { return x.toString(10); }).join("");
		} else {
			digits[i] = 0;
		}
	}
	return flag; // Overflow.
}
Item.prototype.getState = function(cb) {
	var item = this;
	var URI = item.getURI();
	repo.getMeta(URI, {}, function(err, meta) {
		if(err) return cb(err, null);
		var state = flagstate(meta["completed"]);
		var flag = (1 === parseInt(state[state.length-1], 10) % 2);
		return cb(null, flag);
	});
};
Item.prototype.setState = function(completed, cb) {
	var item = this;
	var URI = item.getURI();
	repo.getMeta(URI, {}, function(err, meta) {
		if(err) return cb(err, null);
		var state = flagstate(meta["completed"]);
		var crdt = {"completed": {}};
		crdt["completed"][flaginc(state)] = {};
		repo.submitMeta(URI, crdt, {}, function(err, info) {
			if(err) return cb(err, null);
			return cb(null, null);
		});
	});
};
Item.byURI = {};
Item.load = function(URI, cb) {
	var item = this;
	repo.getFile(URI, { encoding: "utf8" }, function(err, info) {
		if(err) return cb(err, null);
		// TODO: Check TYPE === info.type
		var item = Item.parse(info.data);
		if(!item) return cb(new Error("parse error"), null);
		Item.byURI[URI] = item;
		return cb(null, item);
	});
};
Item.parse = function(str) {
	var x = /^(hash:\/\/[\w\d.-]+\/[\w\d.%_-]+)?(?:\r\n|\r|\n)(?:\r\n|\r|\n)(.*)$/.exec(str);
	if(!x) return null;
	return new Item(x[1] || null, x[2]);
};


document.getElementById("new").onchange = function(e) {
	var input = this;
	var content = input.value.trim();
	input.value = "";
	if(!content.length) return;
	var item = new Item(null, content);
	var uri = item.getURI();
	var buf = new Buffer(item.format(), "utf8");
	repo.submitFile(buf, TYPE, { uri: uri }, function(err, fileinfo) {
		if(err) throw err;
		var meta = {
//			"submitter-name": "",
//			"submitter-repo": "",
			"submission-software": "TodoDAV",
			"submission-time": (new Date).toISOString(), // TODO: Strip timezone.
			"type": TYPE, // HACK
		};
		repo.submitMeta(uri, meta, {}, function(err, metainfo) {
			if(err) throw err;
		});
	});
};


// TODO: We need to be careful about race conditions when first loading.
// 1. Start watching for meta-files
// 2. Record all meta-files seen
// 3. Load latest files
// 4. Apply (possibly redundant) meta-file updates
// Also the case of reconnection requires us to be similarly careful.
var updates = repo.createMetafilesStream({ count: 1, start: "", wait: true, dir: "a" });
updates.on("data", function(obj) {
	console.log("updated", obj);
});

// TODO: This query is a hack.
// We should also allow custom queries?
var stream = repo.createQueryStream("type='"+TYPE+"'", { count: 2, wait: false, dir: "z" })
stream.on("data", function(URI) {
	stream.pause();

	Item.load(URI, function(err, item) {
		if(err) {
			console.log(err);
			stream.resume();
			return;
		}
		item.getState(function(err, flag) {
			if(err) {
				console.log(err);
				stream.resume();
				return;
			}
			item.internal.checkbox.checked = flag;
			document.getElementById("main").appendChild(item.element);
			stream.resume();
		});
	});

});


