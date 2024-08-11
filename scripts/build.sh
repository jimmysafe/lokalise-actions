#!/bin/bash

parent_directory="modules"

for dir in "$parent_directory"/*/; do
  if [ -d "$dir" ]; then
    cd "$dir" && npm run build && cd - > /dev/null
  fi
done
