import amqplib from 'amqplib';
import winston from 'winston';
import process from 'process';

import { tgParser, downloader, ocr } from './index.js';
import { loopRetryingAndLogging } from '../src/utils.js';

// TODO: winston.loggers.add('category1' https://github.com/winstonjs/winston#working-with-multiple-loggers-in-winston
const getLogger = (service) => {
    const logger = winston.createLogger({
        transports: [
            new winston.transports.File({ filename: `logs/${service}.log` }),
        ],
        defaultMeta: { service: service },
        exitOnError: false,
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }

    return logger;
};

const loggerByService = {
    tgParser: getLogger('tg-parser'),
    downloader: getLogger('downloader'),
    ocr: getLogger('ocr'),
};

const startServices = async (amqpConn) => {
    return Promise.all([
        tgParser(amqpConn, loggerByService.tgParser),
        downloader(amqpConn, loggerByService.downloader),
        ocr(amqpConn, loggerByService.ocr),
    ]);
};

const main = async () => {
    const loggerMain = getLogger('main');
    loggerMain.info('Hello, MemeSearch');

    await loopRetryingAndLogging(async () => {
        const amqpConn = await amqplib.connect(process.env.AMQP_ENDPOINT);
        loggerMain.info('Main loop started');
        await startServices(amqpConn);
    }, loggerMain);
};

main();
