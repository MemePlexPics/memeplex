import process from 'process'
import 'dotenv/config'
import { init } from './utils'
import { getElasticClient } from '../../../../utils'
import { getTranslation } from './i18n'
import { getLogger } from '../utils'

const start = async () => {
  const logger = getLogger('tg-bot')
  const elastic = await getElasticClient()
  const bot = await init(
    process.env.TELEGRAM_BOT_TOKEN,
    {
      telegram: {
        webhookReply: false,
      },
    },
    logger,
  )

  bot.launch({
    webhook: {
      domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
      path: '/' + process.env.TELEGRAM_BOT_WEBHOOK_PATH,
      port: 3082,
    },
  })

  for (const language of ['', 'en', 'ru'] as const) {
    const t = getTranslation(language)
    await bot.telegram.setMyCommands(
      [
        { command: 'menu', description: t.command.callCurrentMenu() },
        { command: 'get_latest', description: t.command.getLatest() },
        { command: 'suggest_channel', description: t.command.suggestChannel() },
        { command: 'help', description: t.command.help() },
        { command: 'stats', description: t.command.stats() },
      ],
      { language_code: language },
    )
    await bot.telegram.setMyDescription(t.profile.description(), language)
    await bot.telegram.setMyShortDescription(t.profile.shortDescription(), language)
  }
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', async () => {
    await elastic.close()
    bot.stop('SIGINT')
  })
  process.once('SIGTERM', async () => {
    await elastic.close()
    bot.stop('SIGTERM')
  })
}

start()
