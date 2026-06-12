#!/bin/bash

# This script updates the extension manifest versions.

# Check if the version argument was provided.
if [[ -z $1 ]]; then
  echo "Error: Version number argument is required."
  exit 1
fi

node scripts/set-extension-version.js "$1"
