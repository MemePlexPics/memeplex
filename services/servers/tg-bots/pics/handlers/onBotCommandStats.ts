import { getDbConnection } from '../../../../../utils'
import { getTodayBotUserStats } from '../../../../../utils/mysql-queries'
import { getMemeStats, getServerFreeSpaceGb } from '../../../utils'
import { getTranslation } from '../i18n'
import type { TTelegrafContext } from '../types'

export const onBotCommandStats = async (ctx: TTelegrafContext) => {
  const db = await getDbConnection()
  let userStats: Awaited<ReturnType<typeof getTodayBotUserStats>>
  let memeStats: Awaited<ReturnType<typeof getMemeStats>>
  let freeSpaceGb: Awaited<ReturnType<typeof getServerFreeSpaceGb>>

  try {
    ;[userStats, memeStats, freeSpaceGb] = await Promise.all([
      getTodayBotUserStats(db),
      getMemeStats(ctx.elastic),
      getServerFreeSpaceGb(),
    ])
  } finally {
    await db.close()
  }

  await ctx.reply(
    getTranslation(ctx.from.language_code).message.stats(userStats, memeStats, freeSpaceGb),
  )
}
