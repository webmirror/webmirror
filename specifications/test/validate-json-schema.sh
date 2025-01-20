#!/usr/bin/env bash

find "$(dirname "$0")/.." -name "*.schema.json" -exec ajv compile -s {} --spec=draft2020 \;
