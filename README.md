# MemePlex

<p align="center">
    <a href="https://memeplex.pics">
        <img alt="WebSite" src="https://img.shields.io/badge/website-000000?style=for-the-badge&logoColor=white" />
    </a>
    <a href="https://t.me/memeplex_pics">
        <img alt="Join us on Telegram" src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" />
    </a>
    <br><br>
    <img alt="MemePlex logo" src="./frontend/src/assets/images/logo/logo_600.png" />
</p>

## Описание

[MemePlex](https://memeplex.pics/) - поисковая система для мемов русско- и украиноязычного нижнего телеграма.

Мы индексируем нишевые телеграм-каналы, которые обычно пролетают под радаром крупных индексаторов, которые к тому же, как правило, не позволяют искать кириллицей.

Наше главное отличие: мы не воруем контент, и всегда указываем ссылку на оригинал.

Если у вас есть телеграм-канал, вы можете рекомендовать его к добавлению [здесь](https://memeplex.pics/channelList), либо же добавить его в featured channels, репостнув наш [анонс](https://t.me/memeplex_pics/4) и отписавшись в [комментариях](https://t.me/memeplex_pics/20).

## Description

[MemePlex](https://memeplex.pics/) is a meme search engine and catalogue with a focus on Russian and Ukrainian underground Telegram content.

We index niche telegram channels that usually fly under the radar of big meme indexers, that usually don't even allow to search content in languages other than English.

Our distinguishing feature is that we don't steal the content (there's always a link to the original).

If you have a telegram channel, you can suggest it [here](https://memeplex.pics/channelList), or add it to "featured channels" by reposting our announcement (see [here](https://t.me/memeplex_pics/4)) and let us know in the [comments](https://t.me/memeplex_pics/20).

## Links

- [Website](https://memeplex.pics/)
- [Telegram bot](https://t.me/MemePlexBot)
- [Telegram channel](https://t.me/memeplex_pics) (news and announcements)

## Requirements

- [ocr.space](https://ocr.space) API key
- [TelegramApiServer](https://github.com/xtrime-ru/TelegramApiServer)
- [TelegramRSS](https://github.com/xtrime-ru/TelegramRSS)
- Docker
- RabbitMQ (will be installed automatically using the ./docker-compose.yml)
- ElasticSearch (will be installed automatically using the ./docker-compose.yml)

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
- Run `bash ./scripts/elastic-certs.sh` to create a self-signed TLS certificate for ElasticSearch
- Run `npx tsx ./scripts/create-index.ts` to create (or replace) an ElasticSearch index
- Run `npm run migrations:run` to create MySQL tables
- Run `npm run build:front` to build static frontend files
- Run `npm run build:back` to transpile files for backend

## Startup

- Run `docker compose up -d` to start docker services
- Run `npm run service:memesearch` - Telegram parser
- Run `npm run service:web` - web server
- Run `npm run service:pics` - Telegram Pics bot server
- Run `npm run service:publisher` - Telegram Publisher bot server

## Scripts

### Sitemap generator

1. Run `node ./scripts/generate-sitemap.js` once a day to generate the sitemap.xml (for all previous days when first run and for the previous day every time after that)
2. Rebuild the frontend using `npm run build` or just run `cp -r ./frontend/src/public/sitemaps ./frontend/dist/. && cp ./frontend/src/public/sitemap.xml ./frontend/dist/sitemap.xml`
- It might be a good idea to run it via Cron at the beginning of the day, like this:
```bash
0 0 * * * bash -c 'cd /path/to/project && npx tsx ./scripts/generate-sitemap.ts && cp -r ./frontend/src/public/sitemaps ./frontend/dist/. && cp ./frontend/src/public/sitemap.xml ./frontend/dist/sitemap.xml'
```

## Backup

### Files:

```bash
rsync --archive -progress --update user@host:remote_path local_path
```

### ElasticSearch:

```bash
# Run to init a snapshot repository for ElasticSearch
bash ./scripts/backup/elastic-init.sh

# Run to start taking snapshot
bash ./scripts/backup/elastic-snapshot.sh

# Run to restore ElasticSearch from snapshots
bash ./scripts/backup/elastic-restore.sh
```

### Mysql:

```bash
ssh user@host "bash ./path_to_project/scripts/backup/mysql.sh" | gzip > memeplex_$(date +%Y%m%d-%H%M%S).sql.gz
```
