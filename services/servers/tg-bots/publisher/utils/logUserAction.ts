import { User } from 'telegraf/typings/core/types/typegram'
import { getTelegramUser } from '../../utils'

export const logUserAction = async (tgUser: User, logEntity: Record<string, string | number>) => {
  const { id, user } = getTelegramUser(tgUser)
  global.logger.info({ id, user, ...logEntity })
}
