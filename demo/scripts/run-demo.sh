#!/usr/bin/env bash

# https://stackoverflow.com/a/24112741/4466589
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

# https://stackoverflow.com/a/52033580/4466589
(
    trap 'kill 0' SIGINT;
    valkey-server --save "" &
    ./serve-datasets.sh &
    ./serve-sites.sh &
    ../../webmirror-go/bin/webmirror-tracker-api &
    ../../webmirror-go/bin/webmirror-tracker-validator &
    ./register-datasets.sh &
    wait
)
