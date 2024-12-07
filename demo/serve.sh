#!/usr/bin/env bash

# Dependencies
#
# http-server
#   https://www.npmjs.com/package/http-server

http-server directory/ -p 9090 -c'-1' -t'0' --cors='*' --mimetypes='mimetypes'