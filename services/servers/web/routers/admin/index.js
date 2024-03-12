import express from 'express';
import process from 'process';
import winston from 'winston';
import {
    channelPost,
    channelDelete,
    featuredChannelPost,
    featuredChannelDelete,
    featuredChannelGet,
    channelSuggestionProceedPost,
    memeStatePut,
    channelMemesStatePut,
} from './methods/index.js';
import { setLogAction } from './utils/index.js';

export const adminRouter = express.Router();

const logger = winston.createLogger({
    defaultMeta: { service: 'web-admin' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/web-admin.log',
            maxsize: 1024*1024*10, // bytes
            maxFiles: 5,
            tailable: true,
        }),
    ],
});

const isAdmin = (req, res, next) => {
    const { password } = req.body;
    if (password === process.env.MEMEPLEX_ADMIN_PASSWORD) {
        res.locals.role = 'Admin';
        return next();
    }
    if (password === process.env.MEMEPLEX_MODERATOR_PASSWORD) {
        res.locals.role = 'Moderator';
        return next();
    }
    setLogAction(res, '403');
    return res.status(403).send();
};

const logAdminAction = (req, res, next) => {
    res.on( 'finish', () => {
        if (res.locals.action) logger.info({
            url: req.url,
            action: res.locals.logAction,
            role: res.locals.role,
            ip: req.ip,
        });
    });
    next();
};

adminRouter.use(isAdmin, logAdminAction);

adminRouter.post('/channel', channelPost);
adminRouter.delete('/channel', channelDelete);
adminRouter.put('/channel/memes/state', channelMemesStatePut);

adminRouter.post('/featuredChannel', featuredChannelPost);
adminRouter.delete('/featuredChannel', featuredChannelDelete);
adminRouter.post('/featuredChannel/get', featuredChannelGet);

adminRouter.post('/channelSuggestion/proceed', channelSuggestionProceedPost);

adminRouter.put('/meme/state', memeStatePut);
