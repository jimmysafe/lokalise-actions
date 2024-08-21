#!/bin/bash

#! TO BE DELETED, FOR TESTING PURPOSES ONLY

./scripts/build.sh &&
git add . && 
git commit -m 'build' && 
git push origin main &&
./scripts/minor-release.sh
# ./scripts/deploy.sh