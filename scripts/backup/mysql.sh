#!/usr/bin/env bash

set -a
source .env
set +a

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_DATABASE
