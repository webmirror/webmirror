#!/usr/bin/env bash

set -e

find ./directory \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    -exec ../webmirror-go/bin/webmirror-cli describe {} \;
