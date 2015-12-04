// Copyright 2015 ArchiveLabs, et al.
// MIT Licensed?

var sln = require("./sln-client");

var repo = sln.createRepo("/", null);

function formatItem(parentURI, content) {
	return (parentURI||"")+"\r\n\r\n"+content;
}
function parseItem(item) {
	var x = /^(hash:\/\/[\w\d.-]+\/[\w\d.%_-]+)?(?:\r\n|\r|\n)(?:\r\n|\r|\n)(.*)$/.exec(item);
	if(!x) return null;
	return {
		parentURI: x[1] || null,
		content: x[2],
	};
}

// TODO: Query by file type for our todo item files?
var stream = repo.createQueryStream("", { count: 10, wait: false, dir: "z" })
stream.on("data", function(URI) {
	stream.pause();

	repo.getFile(URI, { encoding: "utf8" }, function(err, info) {
		if(err) throw err;
		var item = parseItem(info.data);
		console.log(item);

		stream.resume();
	});

});

