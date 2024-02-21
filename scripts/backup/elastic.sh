set -a
source .env
set +a

DATE=$(date +%Y%m%d-%H%M%S)
curl \
    --user "$(ELASTIC_USERNAME):$(ELASTIC_PASSWORD)" \
    -XPUT "$(ELASTIC_ENDPOINT)/_snapshot/elastic/$(DATE)?wait_for_completion=true"
