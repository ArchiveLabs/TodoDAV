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
	return "hash://sha256/"+sha256.read();
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



// TODO: Query by file type for our todo item files?
var stream = repo.createQueryStream("", { count: 10, wait: false, dir: "z" })
stream.on("data", function(URI) {
	stream.pause();

	Item.load(URI, function(err, item) {
		console.log(err, item);
		if(err) {
			stream.resume();
			return;
		}
		document.getElementById("main").appendChild(item.element);
		stream.resume();
	});

});

