#!/usr/bin/env bash

HOST="178.128.165.0"

rsync --info=progress2 \
    --filter=':- .gitignore' \
    --exclude-from=.rsyncignore \
    --verbose \
    -a \
    . \
    "$HOST:/home/bora/webmirror/"
