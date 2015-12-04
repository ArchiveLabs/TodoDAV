# TodoDAV.js

description TODO

## Building

Requirements:

- StrongLink
- Make
- Browserify

```bash
make
```

## Running

For now, TodoDAV.js must be hosted by the StrongLink server to which it will connect. The easiest way to do this is to copy or symlink the ./build directory into the StrongLink repo's public directory:

```bash
cd /path/to/repo/
ln -s /path/to/TodoDav/tododav-js/build tododav
```

Then browse to `http://localhost:8000/tododav`.

## File type

The file type used by todo list items is as follows:

```
[optional parent URI]

item content
```

For root items, the URI line is blank (meaning the file begins with two blank lines).

The text encoding is UTF-8. For now I think it's better to use CRLF line endings by default (though we should be able to read LF and CR too).

Because StrongLink identifies files by hash, two files with the same content and same parent will be seen as the same file. If you want to create a unique root that other people won't use, put some unique content in it (like your name).

For now I guess item content is plain text, although maybe we should support Markdown?

