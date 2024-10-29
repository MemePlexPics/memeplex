#!/usr/bin/env bash

./scripts/mysql-query.sh 'select id from bot_users' | sed -e 's/|//g' > ./user_ids"$(date)".txt
