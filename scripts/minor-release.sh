#!/bin/bash

# Set the tag name to the first argument, or default to 'main-v1' if not provided
TAG_NAME=${1:-main-v1}

# Create and push the tag
git tag "$TAG_NAME" -f && 
git push origin "$TAG_NAME" -f