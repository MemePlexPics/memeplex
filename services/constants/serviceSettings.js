import { tgParser, downloader, ocr, checkProxies } from '../index.js';
import { CYCLE_SLEEP_TIMEOUT } from '../../constants/index.js';
import { findNewProxies } from '../utils/index.js';

export const serviceSettings = [
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
    },
    {
        name: 'proxy-finder',
        service: findNewProxies,
        loggerSettings: {
            afterCallbackDelayMs: 1000 * 60 * 60,
        },
    },
];
