// Copyright 2015 ArchiveLabs, et al.
// MIT Licensed?

var crypto = require("crypto");

var sln = require("./sln-client");

var TYPE = "text/vnd.tododav.item; charset=utf-8";

var repo = sln.createRepo("/", null);

function has(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

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
	item.meta = {};
	item.metafiles = {};
	item.internal = {};
	item.element = clone("item", item.internal);
	item.internal.content.appendChild(document.createTextNode(item.content));
	item.internal.checkbox.onclick = function() {
		item.setState(this.checked, function(err) {
			if(err) {
				console.log(err);
				item.internal.checkbox.checked = item.getState();
			}
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
function merge(src, dst) { // TODO: sln.mergeMeta ?
	for(var x in src) if(has(src, x)) {
		if(!has(dst, x)) dst[x] = {};
		if("string" === typeof src[x]) {
			dst[x][src[x]] = {};
		} else {
			merge(src[x], dst[x]);
		}
	}
}
Item.prototype.getState = function() {
	var item = this;
	var state = flagstate(item.meta["completed"]);
	return 1 === parseInt(state[state.length-1], 10) % 2;
};
Item.prototype.setState = function(completed, cb) {
	var item = this;
	var URI = item.getURI();
	var state = flagstate(item.meta["completed"]);
	var crdt = {"completed": {}};
	crdt["completed"][flaginc(state)] = {};
	repo.submitMeta(URI, crdt, {}, function(err, info) {
		if(err) return cb(err);
		merge(crdt, item.meta);
		item.metafiles[info.uri] = 1;
		// TODO: If we knew this hash earlier, we could ensure we
		// didn't load the meta-file we just submitted...

		return cb(null);
	});
};
Item.prototype.update = function(metaURI, cb) {
	var item = this;
	if(has(item.metafiles, metaURI)) return cb(null);
	var opts = {
		"accept": sln.metatype,
		"encoding": "utf8"
	};
	repo.getFile(metaURI, opts, function(err, info) {
		if(err) return cb(err);
		// TODO: sln.parseMetaFile ?
		var json = /[\r\n][^]*$/.exec(info.data)[0]; // TODO?
		var src = JSON.parse(json);
		merge(src, item.meta);
		item.metafiles[metaURI] = 1;
		item.internal.checkbox.checked = item.getState();
		return cb(null);
	});
};
Item.byURI = {};
Item.load = function(URI, cb) {
	var item = this;
	repo.getFile(URI, { encoding: "utf8" }, function(err, info) {
		if(err) return cb(err, null);
		if(TYPE !== info.type) return cb(new Error("mime error"), null);
		var item = Item.parse(info.data);
		if(!item) return cb(new Error("parse error"), null);
		Item.byURI[URI] = item;
		repo.getMeta(URI, {}, function(err, info) {
			if(err) return cb(err, null);
			merge(info, item.meta);
			// TODO: We should record the meta-files here, but the
			// API doesn't give them. Doesn't matter much though.
			item.internal.checkbox.checked = item.getState();
			return cb(null, item);
		});
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
			"title": content,
			"type": TYPE, // HACK
		};
		repo.submitMeta(uri, meta, {}, function(err, metainfo) {
			if(err) throw err;
		});
	});
};

var main = document.getElementById("main");
var latestMeta = null;
var latestFile = null;

// TODO: We need to be careful about race conditions when first loading.
// 1. Start watching for meta-files
// 2. Record all meta-files seen
// 3. Load latest files
// 4. Apply (possibly redundant) meta-file updates
// Also the case of reconnection requires us to be similarly careful.
var updates = repo.createMetafilesStream({ count: 1, start: "", wait: false, dir: "z" });
updates.on("data", function(info) {
	latestMeta = info.uri;
});
updates.on("end", function() {


// TODO: This query is a hack.
// We should also allow custom queries?
var stream = repo.createQueryStream("type='"+TYPE+"'", { count: 50, wait: false, dir: "z" })
stream.on("data", function(URI) {

	if(!latestFile) latestFile = URI;

	var tmp = clone("loading", null);
	main.appendChild(tmp);

	Item.load(URI, function(err, item) {
		if(err) {
			main.removeChild(tmp);
			console.log(err);
			stream.resume();
			return;
		}
		main.replaceChild(item.element, tmp);
	});

});
stream.on("end", function() {

	stream = repo.createQueryStream("type='"+TYPE+"'", { start: latestFile, wait: true });
	stream.on("data", function(URI) {

		latestFile = URI;

		var tmp = clone("loading", null);
		main.insertBefore(tmp, main.childNodes[0]);

		Item.load(URI, function(err, item) {
			if(err) {
				main.removeChild(tmp);
				console.log(err);
				stream.resume();
				return;
			}
			main.replaceChild(item.element, tmp);
		});


	});


	var updates = repo.createMetafilesStream({ start: latestMeta, wait: true });
	updates.on("data", function(info) {
		var item = Item.byURI[info.target];
		if(item) item.update(info.uri, function(){});
		latestMeta = info.uri;
	});


});


});

