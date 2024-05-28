import type { User } from '@telegraf/types'
import { getDbConnection } from '../../../../../utils'
import {
  insertBotAction,
  insertBotInlineAction,
  upsertBotInlineUser,
  upsertBotUser,
  selectBotInlineUser,
  selectBotUser,
} from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import type { Logger } from 'winston'

export const logUserAction = async (
  from: User,
  action: {
    search?: {
      query: string
      page: number
    }
    latest?: {
      from: number
      to: number
    }
    inline_search?: {
      query: string
      page: number
      chat_type: string
    }
    inline_select?: {
      query: string
      id: string
    }
    info?: string
    start?: string | 1
  },
  logger: Logger,
) => {
  const { id, user } = getTelegramUser(from)
  let logEntity = {}
  const db = await getDbConnection()
  if (action.search) {
    const existedUser = await selectBotUser(db, id)
    if (!existedUser?.id)
      await upsertBotUser(db, {
        id,
        user,
      })
    await insertBotAction(db, {
      userId: id,
      action: 'search',
      query: action.search.query,
      page: action.search.page + '',
    })
    logEntity = {
      action: 'search',
      ...action.search,
    }
  } else if (action.latest) {
    const existedUser = await selectBotUser(db, id)
    if (!existedUser?.id)
      await upsertBotUser(db, {
        id,
        user,
      })
    await insertBotAction(db, {
      userId: id,
      action: 'latest',
      query: null,
      page: [action.latest.from, action.latest.to].join(','),
    })
    logEntity = {
      action: 'latest',
      ...action.latest,
    }
  } else if (action.inline_search) {
    const existedUser = await selectBotInlineUser(db, id)
    if (!existedUser?.id)
      await upsertBotInlineUser(db, {
        id,
        user,
      })
    await insertBotInlineAction(db, {
      userId: id,
      action: 'search',
      query: action.inline_search.query,
      selectedId: null,
      page: action.inline_search.page + '',
      chatType: action.inline_search.chat_type,
    })
    logEntity = {
      action: 'inline_search',
      ...action.inline_search,
    }
  } else if (action.inline_select) {
    const existedUser = await selectBotInlineUser(db, id)
    if (!existedUser?.id)
      await upsertBotInlineUser(db, {
        id,
        user,
      })
    await insertBotInlineAction(db, {
      userId: id,
      action: 'select',
      query: action.inline_select.query,
      selectedId: action.inline_select.id,
      page: null,
      chatType: null,
    })
    logEntity = {
      action: 'inline_select',
      selected_id: action.inline_select.id,
      ...action.inline_select,
    }
  } else if (action.start) {
    await upsertBotUser(db, {
      id,
      user,
    })
    logEntity = {
      start: action.start,
    }
  } else if (action.info) {
    logEntity = {
      action: 'info',
      text: action.info,
    }
  }
  await db.close()
  logger.info({ id, user, ...logEntity })
}
