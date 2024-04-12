#!/usr/bin/env bash

set -a
source .env
set +a

curl \
    --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -XPUT "$ELASTIC_ENDPOINT/_snapshot/elastic" \
    -d '{
        "type": "fs",
        "settings": {
            "location": "./elastic",
            "compress": true
        }
    }'
