import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'

export const logUserAction = async (
  ctx: TTelegrafContext,
  logEntity: Record<string, string | number>,
) => {
  if (!ctx.from) {
    throw new Error(`There is no ctx.from (${ctx.session.state}): ${JSON.stringify(logEntity)}`)
  }
  const { id, user } = getTelegramUser(ctx.from)
  ctx.logger.info({ id, user, state: ctx.session.state, ...logEntity })
}
