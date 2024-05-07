import express, { RequestHandler } from 'express'
import process from 'process'
import 'dotenv/config'
import winston from 'winston'
import {
  channelPost,
  channelDelete,
  featuredChannelPost,
  featuredChannelDelete,
  featuredChannelGet,
  channelSuggestionProceedPost,
  memeStatePut,
  channelMemesStatePut,
} from './methods'
import { blacklistPut } from './methods'

export const adminRouter = express.Router()

const logger = winston.createLogger({
  defaultMeta: { service: 'web-admin' },
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: 'logs/web-admin.log',
      maxsize: 1024 * 1024 * 10, // bytes
      maxFiles: 5,
      tailable: true,
    }),
  ],
})

const isAdmin: RequestHandler = (req, res, next) => {
  const { password } = req.body
  if (password === process.env.MEMEPLEX_ADMIN_PASSWORD) {
    res.locals.role = 'Admin'
    return next()
  }
  if (password === process.env.MEMEPLEX_MODERATOR_PASSWORD) {
    res.locals.role = 'Moderator'
    return next()
  }
  logger.info({
    url: req.url,
    action: 403,
    ip: req.ip,
  })
  return res.status(403).send()
}

const logAdminAction: RequestHandler = (req, res, next) => {
  res.on('finish', () => {
    if (res.locals.logAction)
      logger.info({
        url: req.url,
        action: res.locals.logAction,
        role: res.locals.role,
        ip: req.ip,
      })
  })
  next()
}

// eslint-disable-next-line no-unused-vars
adminRouter.get('/', (_req, _res) => {
  throw new Error('404')
})

adminRouter.use(isAdmin, logAdminAction)

adminRouter.post('/channel', channelPost)
adminRouter.delete('/channel', channelDelete)
adminRouter.put('/channel/memes/state', channelMemesStatePut)

adminRouter.post('/featuredChannel', featuredChannelPost)
adminRouter.delete('/featuredChannel', featuredChannelDelete)
adminRouter.post('/featuredChannel/get', featuredChannelGet)

adminRouter.post('/channelSuggestion/proceed', channelSuggestionProceedPost)

adminRouter.put('/meme/state', memeStatePut)

adminRouter.put('/blacklist', blacklistPut)
