import { User } from 'telegraf/typings/core/types/typegram'

export const getTelegramUser = (
  from: User,
  prefix: string = '@'
): { id: number; user: string } => {
  const { id, username, first_name, last_name } = from
  return {
    id,
    user: username ? prefix + username : [first_name, last_name].join(' ')
  }
}
