import process from 'process'
import 'dotenv/config'
import { init, sendMessageToIds } from '../services/servers/tg-bots/pics/utils'
import { getLogger } from '../services/servers/tg-bots/utils'
import { getDbConnection, selectAllBotUsers } from '../utils/mysql-queries'

const start = async () => {
  const db = await getDbConnection();
  const logger = getLogger('tg-bot')
  const allUsers = await selectAllBotUsers(db);
  console.log(allUsers);

  const bot = await init(
    process.env.TELEGRAM_BOT_TOKEN,
    {
      telegram: {
        webhookReply: false,
      },
    },
    logger,
  )

  console.log(bot);
}

start();
