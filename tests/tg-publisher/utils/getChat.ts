import { handle } from '@vishtar/telegram-test-api/lib/routes/bot/utils'
import { TExpressRoute } from '../types'

export const getChat: TExpressRoute = (app, telegramServer) => {
  handle(app, '/bot:token/getChat', (req, res, _next) => {
    const isChatIdNumber = typeof req.body.chat_id === 'number'
    const chat_id = isChatIdNumber ? req.body.chat_id : req.body.chat_id.replace('@', '')
    // @ts-expect-error object
    const data = { ok: true, result: telegramServer.mockApi.getChat[chat_id] }
    // @ts-expect-error .sendResult() in any
    res.sendResult(data)
  })
}
