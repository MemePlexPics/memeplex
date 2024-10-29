import process from 'process'
import fs from 'fs'
import 'dotenv/config'
import { init, sendMessageToIds } from '../services/servers/tg-bots/pics/utils'
import { getLogger } from '../services/servers/tg-bots/utils'
import { selectAllBotUsers } from '../utils/mysql-queries'
import { getDbConnection } from '../utils'

const start = async () => {
  const db = await getDbConnection();
  const logger = getLogger('tg-bot')
  const allUsers = await selectAllBotUsers(db);

  const bot = await init(
    process.env.TELEGRAM_BOT_TOKEN,
    {
      telegram: {
        webhookReply: false,
      },
    },
    logger,
  )

  const message = fs.readFileSync('../broadcast.txt');

  console.log(message);
  // await sendMessageToIds(bot, allUsers.map(x => x.id), message);
  console.log('complete');
}

start();
