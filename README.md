# MemePlex

[MemePlex](https://memeplex.pics/) is a search engine for memes with a focus on Russian underground Telegram / это поисковая система для мемов нижнего Телеграма.

## Links

- [Website](https://memeplex.pics/)
- [Telegram bot](https://t.me/MemePlexBot)
- [Telegram channel](https://t.me/memeplex_pics) (news and announcements)

## Requirements

- [ocr.space](https://ocr.space) API key
- [TelegramApiServer](https://github.com/xtrime-ru/TelegramApiServer)
- [TelegramRSS](https://github.com/xtrime-ru/TelegramRSS)
- RabbitMQ
- ElasticSearch

## Setup

- Run `npm run init` to initialize the project
- Get free or paid ocr.space API key and put it into .env
- Set up TelegramApiServer (requires an app key, used to parse telegram channels)
- Set `TG_API_ENDPOINT`, `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` in `.env`
- Set up TelegramRSS (needed to download image data)
- Set `TG_RSS_ENDPOINT` in `.env`
- Set up RabbitMQ - set `AMQP_ENDPOINT` in `.env`
- Set `ELASTIC_ENDPOINT` in `.env`
- Run `docker compose up -d` to start docker services
- Run `node ./scripts/create-index.js` to create an ElasticSearch index
- Run `node ./scripts/create-tables.js` to create MySQL tables
- Run `npm run build` to build static frontend files

## Startup

- Run `docker compose up -d` to start docker services
- Run `node ./services/memesearch.js` - Telegram parser
- Run `node ./services/servers/web.js` - web server
- Run `node ./services/servers/tg-bot.js` - Telegram bot server

## Backup

1. Files:

```
rsync --archive -progress --update user@host:remote_path local_path
```

2. ElasticSearch:

```
# Run to init a snapshot repository for ElasticSearch
bash ./scripts/backup/init-elastic.sh

# Run to start taking snapshot
bash ./scripts/backup/elastic.sh

# You should find the snapshot you took in the ./backup/elastic directory
```

3. Mysql:

```
ssh user@host "bash ./path_to_project/scripts/backup/mysql.sh" | gzip > memeplex_$(date +%Y%m%d-%H%M%S).sql.gz
```
