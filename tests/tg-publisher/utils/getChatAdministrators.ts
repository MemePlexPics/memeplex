import { handle } from '@vishtar/telegram-test-api/lib/routes/bot/utils'
import type { TExpressRoute } from '../types'

export const getChatAdministrators: TExpressRoute = (app, telegramServer) => {
  handle(app, '/bot:token/getChatAdministrators', (req, res, _next) => {
    const chat_id =
      typeof req.body.chat_id === 'number' ? req.body.chat_id : req.body.chat_id.replace('@', '')
    const data = { ok: true, result: telegramServer.storage.mockApi.getChatAdministrators[chat_id] }
    // @ts-expect-error .sendResult() in any
    res.sendResult(data)
  })
}
