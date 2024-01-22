import winston from 'winston';
import process from 'process';

import { tgParser, downloader, ocr } from './index.js';
import { loopRetrying } from '../src/utils.js';
import { LOOP_RETRYING_DELAY } from '../src/const.js';
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
        defaultMeta: { service },
        transports,
        exitOnError: false,
    });

    return loggers.get(service);
};

const loggerByService = {
    tgParser: getLogger('tg-parser'),
    downloader: getLogger('downloader'),
    ocr: getLogger('ocr'),
    proxyChecker: getLogger('proxy-checker'),
    proxyFinder: getLogger('proxy-finder'),
};

const startServices = async (loggerMain) => {
    // TODO: DRY
    loopRetrying(async () => {
        loggerMain.info('tgParser start');
        await tgParser(loggerByService.tgParser);
    }, {
        logger: loggerByService.tgParser,
        catchDelayMs: LOOP_RETRYING_DELAY,
    });

    loopRetrying(async () => {
        loggerMain.info('downloader start');
        await downloader(loggerByService.downloader);
    }, {
        logger: loggerByService.downloader,
        catchDelayMs: LOOP_RETRYING_DELAY,
    });

    loopRetrying(async () => {
        loggerMain.info('ocr start');
        await ocr(loggerByService.ocr);
    }, {
        logger: loggerByService.ocr,
        catchDelayMs: LOOP_RETRYING_DELAY,
    });

    loopRetrying(async () => {
        loggerMain.info('Proxy checker started');
        await checkProxies(loggerByService.proxyChecker);
    }, {
        logger: loggerByService.proxyChecker,
        delayMs: 1000*60*60, // Once in 1 hr
        catchDelayMs: LOOP_RETRYING_DELAY,
    });

    loopRetrying(async () => {
        loggerMain.info('Proxy finder started');
        await findNewProxies(loggerByService.proxyFinder);
    }, {
        logger: loggerByService.proxyFinder,
        delayMs: 1000*60*60*6, // Once in 6 hr
        catchDelayMs: LOOP_RETRYING_DELAY,
    });
};

const main = async () => {
    const loggerMain = getLogger('main');
    loggerMain.info('Hello, MemeSearch');
    await insertOcrKeysIntoDb();
    await startServices(loggerMain);
};

await main();
