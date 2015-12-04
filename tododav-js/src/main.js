// Copyright 2015 ArchiveLabs, et al.
// MIT Licensed?

var sln = require("./sln-client");

var repo = sln.createRepo("/", null);

repo.query("", {}, function(err, URIs) {
	console.log(err, URIs);
});

function formatItem(parentURI, content) {
	return (parentURI||"")+"\r\n\r\n"+content;
}
function parseItem(item) {
	var x = /^(|hash:\/\/[\w\d.-]+\/[\w\d.%_-]+)(?:\r\n|\r|\n)(?:\r\n|\r|\n)(.*)$/.exec(item);
	if(!x) return null;
	return {
		parentURI: x[1],
		content: x[2],
	};
}

