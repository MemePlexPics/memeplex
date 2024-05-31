import process from 'process'
import 'dotenv/config'
import { init } from './utils'
import { getElasticClient } from '../../../../utils'
import { i18n } from './i18n'
import { getLogger } from '../utils'

const start = async () => {
  const logger = getLogger('tg-publisher-bot')
  const elastic = await getElasticClient()
  const bot = await init(
    process.env.TELEGRAM_PUBLISHER_BOT_TOKEN,
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
      path: '/' + process.env.TELEGRAM_PUBLISHER_BOT_WEBHOOK_PATH,
      port: 3082,
    },
  })

  bot.telegram.setMyCommands([
    {
      command: 'menu',
      description: i18n['ru'].command.callCurrentMenu(),
    },
    {
      command: 'get_latest',
      description: i18n['ru'].command.getLatest(),
    },
    {
      command: 'suggest_channel',
      description: i18n['ru'].command.suggestChannel(),
    },
    {
      command: 'help',
      description: i18n['ru'].command.help(),
    },
  ])
  bot.telegram.setMyDescription(`
    Это description
  `)
  bot.telegram.setMyShortDescription(`
    Это short description
  `)
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
