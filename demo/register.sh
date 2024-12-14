#!/usr/bin/env bash

TRACKER="http://178.128.165.0"
TOKEN="foobarbazqux"

# MIRROR="https://wm-demo-1-assets.pages.dev"
# MIRROR="http://178.128.165.0:8080"
MIRROR="https://webmirror-demo.s3.eu-west-1.amazonaws.com"

declare -A mirrors
mirrors["ypw5mjhdg3qb2ia4xnuzbiywemsctda5rg3gsbpyvr7hy34nxemq"]="${MIRROR}/bwv-582/"
mirrors["bzcp4cesceixrxnon6uy3gsz6tlh3kma2v2stz4unjcwilv2ueaa"]="${MIRROR}/open-library-database/"
mirrors["5etjyadwydhyelv5why5ffa4qq7cq6a3fwlbb5qb4k6prantditq"]="${MIRROR}/openstreetmap-tiles/"
mirrors["qhlvaga6nfbt24cj2g3wvoyg4gyvznox6262lh2rhhhcmpjvvpqq"]="${MIRROR}/kismet/"
mirrors["ptk4cvuyidlpx5vk35yus7hlxq6edk5xwhs5lkftrtti4cpimhsq"]="${MIRROR}/man-with-a-movie-camera/"

for digest in "${!mirrors[@]}"; do
    echo "\"${digest}\" -> \"${mirrors[$digest]}\""
    curl -X POST "${TRACKER}/v0/servers" \
        -H "Authorization: Bearer ${TOKEN}" \
        --json "{
              \"digest\": \"${digest}\"
            , \"url\"   : \"${mirrors[$digest]}\"
        }"
    echo
done

