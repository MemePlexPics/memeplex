import { loopRetrying } from '../utils/index.js';
import { LOOP_RETRYING_DELAY } from '../constants/index.js';
import { serviceSettings } from './constants/index.js';
import { getLogger, insertOcrKeysIntoDb } from './utils/index.js';
import winston from 'winston';

const loggers = winston.loggers;

const startServices = async (loggerMain) => {
    serviceSettings.forEach((service) => {
        const logger = getLogger(loggers, service.name);
        loopRetrying(
            async () => {
                loggerMain.info(`${service.name} started`);
                await service.service(logger);
            },
            {
                logger,
                catchDelayMs: LOOP_RETRYING_DELAY,
                ...service?.loggerSettings,
            },
        );
    });
};

const main = async () => {
    const loggerMain = getLogger(loggers, 'main');
    loggerMain.info('Hello, MemeSearch');
    await insertOcrKeysIntoDb();
    await startServices(loggerMain);
};

await main();
