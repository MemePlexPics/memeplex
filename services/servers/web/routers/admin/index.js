import express from 'express';
import process from 'process';
import winston from 'winston';
import {
    channelPost,
    channelDelete,
    featuredChannelPost,
    featuredChannelDelete,
    featuredChannelGet,
    proceedChannelSuggestionPost,
} from './methods/index.js';

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
    logger.error(`${req.ip} got 403 on ${req.url}`);
    return res.status(403).send();
};

const logAdminAction = (req, res, next) => {
    res.on( 'finish', () => {
        if (res.locals.action) logger.info({
            role: res.locals.role,
            ip: req.ip,
            url: req.url,
            action: res.locals.action,
        });
    });
    next();
};

adminRouter.use(isAdmin, logAdminAction);

adminRouter.post('/channel', channelPost);

adminRouter.delete('/channel', channelDelete);

adminRouter.post('/featuredChannel', featuredChannelPost);

adminRouter.delete('/featuredChannel', featuredChannelDelete);

adminRouter.post('/getFeaturedChannel', featuredChannelGet);

adminRouter.post('/proceedChannelSuggestion', proceedChannelSuggestionPost);
