#!/bin/bash
set -x

make
mv gxtool.wasm site
mv gxtool.js site
