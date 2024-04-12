#!/usr/bin/env bash

set -a
source .env
set +a

EXCLUDED_INDICES=".security-7"
SNAPSHOTS=$(curl --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" -sXGET "$ELASTIC_ENDPOINT/_snapshot/elastic/_all" | jq -r '.snapshots[].snapshot')



for SNAPSHOT in $SNAPSHOTS; do
    INDICES=$(curl --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" -sXGET "$ELASTIC_ENDPOINT/_snapshot/elastic/$SNAPSHOT" | jq -r '.snapshots[].indices[]')

    FILTERED_INDICES=""
    for INDEX in $INDICES; do
        if [[ ! "$EXCLUDED_INDICES" =~ "$INDEX" ]]; then
            FILTERED_INDICES="$FILTERED_INDICES $INDEX"
        fi
    done

    for INDEX in $FILTERED_INDICES; do
        curl --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" -XPOST "$ELASTIC_ENDPOINT/$INDEX/_close"
    done

    curl --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" -XPOST "$ELASTIC_ENDPOINT/_snapshot/elastic/$SNAPSHOT/_restore"

    for INDEX in $FILTERED_INDICES; do
        curl --user "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" -XPOST "$ELASTIC_ENDPOINT/$INDEX/_open"
    done
done
