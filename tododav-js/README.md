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

