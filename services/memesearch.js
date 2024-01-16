import winston from 'winston';
import process from 'process';

import { tgParser, downloader, ocr } from './index.js';
import { loopRetrying, logError, delay } from '../src/utils.js';
import { LOOP_RETRYING_DELAY } from '../src/const.js';

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

const startServices = async () => {
    return Promise.all([
        tgParser(loggerByService.tgParser),
        downloader(loggerByService.downloader),
        ocr(loggerByService.ocr),
    ]);
};

const main = async () => {
    const loggerMain = getLogger('main');
    loggerMain.info('Hello, MemeSearch');

    await loopRetrying(async () => {
        loggerMain.info('Main loop started');
        await startServices()
            .catch(e => logError(loggerMain, e));
        await delay(LOOP_RETRYING_DELAY);
    }, { logger: loggerMain });
};

main();
