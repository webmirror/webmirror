#!/usr/bin/env bash

find "$(dirname "$0")/../directory" \
    -name "directory-description.json" \
    -exec ajv validate -s "$(dirname "$0")/../../specs/directory-description.schema.json" -d {} --spec=draft2020 \;
