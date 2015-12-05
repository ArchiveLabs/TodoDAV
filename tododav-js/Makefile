# Copyright 2015 ArchiveLabs, et al.
# MIT Licensed?

.SUFFIXES:
.SECONDARY:

ROOT := .
BUILD_DIR := $(ROOT)/build
SRC_DIR := $(ROOT)/src

.PHONY: all
all: $(BUILD_DIR)/index.html $(BUILD_DIR)/index.css $(BUILD_DIR)/index.js

$(BUILD_DIR)/%.html: $(SRC_DIR)/%.html
	@- mkdir -p $(dir $@)
	cp $< $@

$(BUILD_DIR)/%.css: $(SRC_DIR)/%.css
	@- mkdir -p $(dir $@)
	cp $< $@

$(BUILD_DIR)/index.js: $(SRC_DIR)/main.js $(SRC_DIR)/sln-client.js
	@- mkdir -p $(dir $@)
	browserify $< -o $@

.PHONY: clean
clean:
	@- rm -rf $(BUILD_DIR)

