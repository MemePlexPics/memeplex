import winston from 'winston';
import process from 'process';

import { tgParser, downloader, ocr } from './index.js';
import { loopRetrying } from '../src/utils.js';
import { LOOP_RETRYING_DELAY } from '../src/const.js';
import { inserOcrKeysToDb } from '../scripts/insert-keys-to-db.js';
import { insertProxiesIntoDb } from '../scripts/insert-proxies-to-db.js';

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
        new winston.transports.Console({ format: simple() })
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
};

const startServices = async (loggerMain) => {
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
};

const main = async () => {
    const loggerMain = getLogger('main');
    loggerMain.info('Hello, MemeSearch');
    await inserOcrKeysToDb();
    // TODO: Start as a service
    insertProxiesIntoDb();
    loggerMain.info('New OCR keys are inserted into DB');
    await startServices(loggerMain);
};

main();
