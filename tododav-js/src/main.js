// Copyright 2015 ArchiveLabs, et al.
// MIT Licensed?

var sln = require("./sln-client");

var repo = sln.createRepo("/", null);

repo.query("", {}, function(err, URIs) {
	console.log(err, URIs);
});

