import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'

export const logUserAction = async (
  ctx: TTelegrafContext,
  logEntity: Omit<Record<string, string | number>, 'id' | 'user'>,
) => {
  const { id, user } = getTelegramUser(ctx.from)
  ctx.logger.info({ state: ctx.session?.state, ...logEntity, id, user })
}
