import type { CommandContextExtn } from 'telegraf/typings/telegram-types'
import type { TTelegrafContext } from '../types'
import { getDbConnection } from '../../../../../utils'
import type { botUsers } from '../../../../../db/schema'
import {
  selectBotUserById,
  selectBotUserByUsername,
  upsertBotPremiumUser,
} from '../../../../../utils/mysql-queries'

export const onBotCommandSetPremium = async (ctx: TTelegrafContext & CommandContextExtn) => {
  const ADMIN_IDS = process.env.TELEGRAM_BOT_ADMIN_IDS.split(',').map(id => Number(id))
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return
  }
  const { payload } = ctx
  const lines = payload.split('\n')
  const date = lines.shift()
  if (!date || !/^\d\d\d\d-\d\d-\d\d$/.test(date)) {
    throw new Error('Incorrect date')
  }
  const timestamp = Number(new Date(date)) / 1000
  const notFoundedUsers = []
  const db = await getDbConnection()
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue
    }
    const isId = /^[0-9]+$/.test(line)
    let user: typeof botUsers.$inferSelect
    if (!isId) {
      const username = line[0] === '@' ? line : `@${line}`
      const [userInDb] = await selectBotUserByUsername(db, username as `@${string}`)
      user = userInDb
    } else {
      const [userInDb] = await selectBotUserById(db, Number(line))
      user = userInDb
    }
    if (!user) {
      notFoundedUsers.push(line)
      continue
    }
    const userId = user.id
    await upsertBotPremiumUser(db, {
      userId,
      untilTimestamp: timestamp,
    })
  }
  await db.close()
  await ctx.reply(`It's done!`)
  if (notFoundedUsers.length !== 0) {
    await ctx.reply(`There are users not found in bot_users table:\n${notFoundedUsers.join('\n')}`)
  }
}
