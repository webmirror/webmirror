#!/usr/bin/env bash

# https://stackoverflow.com/a/24112741/4466589
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

http-server ../sites/ \
    -p 8080 \
    -c'-1' \
    -t'0' \
    --cors='*'
