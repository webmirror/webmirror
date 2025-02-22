#!/usr/bin/env bash

TRACKER="http://localhost:2020"

# MIRROR="https://wm-demo-1-assets.pages.dev"
# MIRROR="https://webmirror-demo.s3.eu-west-1.amazonaws.com"
MIRROR="http://localhost:9090"

shopt -s globstar

# https://stackoverflow.com/a/24112741/4466589
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

for pathname in ../../demo/**/.webmirror/digest.txt ; do
    digest=$(head -n 1 $pathname)
    dataset=$(basename $(dirname $(dirname $pathname)))
    echo $digest $dataset

    curl "${TRACKER}/v0/datasets/${digest}/mirrors" \
        --json "{ \"url\": \"${MIRROR}/${dataset}/\" }"
    echo

    # Sleep to limit our rate of requests to 1 rps
    sleep 1
done