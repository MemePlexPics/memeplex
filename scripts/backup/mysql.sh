#!/usr/bin/env bash

set -a
source .env
set +a

mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_DATABASE
