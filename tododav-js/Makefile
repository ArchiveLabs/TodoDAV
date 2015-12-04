.PHONY: all
all: ./build/index.html ./build/index.js

./build/index.html: ./src/index.html
	@- mkdir -p $(dir $@)
	cp $< $@

./build/index.js: ./src/main.js
	@- mkdir -p $(dir $@)
	browserify $< -o $@

.PHONY: clean
clean:
	@- rm -rf ./build
