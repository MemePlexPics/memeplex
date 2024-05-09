#!/usr/bin/env bash

# Usage: bash ./scripts/backup/mysql.sh > memeplex_$(date +%Y%m%d-%H%M%S).sql

set -a
source .env
set +a

mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_DATABASE
