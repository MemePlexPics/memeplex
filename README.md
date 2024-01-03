# memeplex

## Requirements

- [ocr.space](https://ocr.space) API key
- [TelegramApiServer](https://github.com/xtrime-ru/TelegramApiServer)
- [TelegramRSS](https://github.com/xtrime-ru/TelegramRSS)
- RabbitMQ
- ElasticSearch

## Setup

- Get free or paid ocr.space API key and put it into .env (see .env.example)
- Set up TelegramApiServer (requires an app key, used to parse telegram channels) - set `TG_API_ENDPOINT` in `.env`
- Set up TelegramRSS (needed to download image data) - set `TG_RSS_ENDPOINT` in `.env`
- Set up ElasticSearch - set `ELASTIC_ENDPOINT` in `.env`
- Run `./scripts/create-index.js` to create an ElasticSearch index
- Set up RabbitMQ - set `AMQP_ENDPOINT` in `.env`
- `mkdir -p data/{phashes,media}`

## Startup

- `node ./src/parse-channels.js`
- `node ./services/downloader.js`
- `node ./services/ocr.js`
