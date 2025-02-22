#!/usr/bin/env bash

set -e

# https://stackoverflow.com/a/24112741/4466589
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

find ../datasets \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    -exec ../../webmirror-go/bin/webmirror-cli describe {} \;
