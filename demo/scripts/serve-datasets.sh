#!/usr/bin/env bash

# Dependencies
#
# http-server
#   https://www.npmjs.com/package/http-server

# https://stackoverflow.com/a/24112741/4466589
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

http-server ../datasets/ \
    -p 9090 \
    -c'-1' \
    -t'0' \
    --cors='*' \
    --mimetypes='config/mimetypes'
