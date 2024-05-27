import { handle } from '@vishtar/telegram-test-api/lib/routes/bot/utils'
import { TExpressRoute } from '../types'

export const getChatMembersCount: TExpressRoute = (app, telegramServer) => {
  handle(app, '/bot:token/getChatMembersCount', (req, res, _next) => {
    const chat_id = typeof req.body.chat_id === 'number' ? req.body.chat_id : req.body.chat_id.replace('@', '')
    // @ts-expect-error object
    const data = { ok: true, result: telegramServer.mockApi.getChatMembersCount[chat_id] }
    // @ts-expect-error .sendResult() in any
    res.sendResult(data)
  })
}
