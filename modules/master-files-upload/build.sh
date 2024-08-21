#!/bin/bash

# Get the full path of the directory containing the script
parent_dir=$(dirname "$(realpath "$0")")
# Get the base name of the directory
dir_name=$(basename "$parent_dir")
# Run ncc build command to create dist folder
ncc build build/$dir_name/src/index.js