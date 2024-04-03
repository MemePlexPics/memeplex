#!/usr/bin/env bash

docker run --rm -v $(pwd)/certs:/certs docker.elastic.co/elasticsearch/elasticsearch:8.11.3 \
/bin/bash -c 'elasticsearch-certutil ca --out /certs/elastic-stack-ca.p12 --pass "" --silent'

docker run --rm -v $(pwd)/certs:/certs docker.elastic.co/elasticsearch/elasticsearch:8.11.3 \
/bin/bash -c 'elasticsearch-certutil cert --ca /certs/elastic-stack-ca.p12 --ca-pass "" --name memesearch-elastic --dns memesearch-elastic --ip 0.0.0.0 --out /certs/elastic-certificates.p12 --pass "" --silent'

openssl pkcs12 -in certs/elastic-certificates.p12 -clcerts -nokeys -out certs/elastic-certificates.crt
