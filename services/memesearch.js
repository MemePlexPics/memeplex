import winston from 'winston';
import process from 'process';

import { tgParser, downloader, ocr } from './index.js';
import { loopRetrying } from '../src/utils.js';
import { LOOP_RETRYING_DELAY, CYCLE_SLEEP_TIMEOUT } from '../src/const.js';
import { insertOcrKeysIntoDb } from '../scripts/insert-keys-into-db.js';
import { checkProxies } from '../scripts/check-proxies.js';
import { findNewProxies } from '../scripts/find-new-proxies.js';

const { combine, timestamp, json, simple } = winston.format;

const loggers = winston.loggers;

const getLogger = (service) => {
    const transports = [
        new winston.transports.File({
            filename: `logs/${service}.log`,
            lazy: true,
            maxsize: 1024*1024*10, // bytes
            maxFiles: 5,
            tailable: true,
            zippedArchive: true,
        }),
    ];
    if (process.env.NODE_ENV !== 'production') transports.push(
        new winston.transports.Console({
            format: simple()
        })
    );

    loggers.add(service, {
        format: combine(
            timestamp(),
            json(),
        ),
        level: 'verbose',
        defaultMeta: { service },
        transports,
        exitOnError: false,
    });

    return loggers.get(service);
};

const serviceSettings = [
    {
        name: 'tg-parser',
        service: tgParser,
        loggerSettings: {
            afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
        },
    },
    {
        name: 'downloader',
        service: downloader,
    },
    {
        name: 'ocr',
        service: ocr,
    },
    {
        name: 'proxy-checker',
        service: checkProxies,
        loggerSettings: {
            afterCallbackDelayMs: 1000*60*60, // Once in 1 hr
        },
    },
    {
        name: 'proxy-finder',
        service: findNewProxies,
        loggerSettings: {
            afterCallbackDelayMs: 1000*60*60*6, // Once in 6 hr
        },
    },
];

const startServices = async (loggerMain) => {
    serviceSettings.forEach((service) => {
        const logger = getLogger(service.name);
        loopRetrying(async () => {
            loggerMain.info(`${service.name} started`);
            await service.service(logger);
        }, {
            logger,
            catchDelayMs: LOOP_RETRYING_DELAY,
            ...service?.loggerSettings,
        });
    });
};

const main = async () => {
    const loggerMain = getLogger('main');
    loggerMain.info('Hello, MemeSearch');
    await insertOcrKeysIntoDb();
    await startServices(loggerMain);
};

await main();
