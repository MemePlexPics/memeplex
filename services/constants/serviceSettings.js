import { tgParser, downloader, ocr } from '../index.js';
import { CYCLE_SLEEP_TIMEOUT } from '../../constants/index.js';
import { findNewProxies, checkProxies } from '../utils/index.js';

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
        loggerSettings: {
            afterCallbackDelayMs: 1000 * 60 * 60, // Once in 1 hr
        },
    },
    {
        name: 'proxy-finder',
        service: findNewProxies,
        loggerSettings: {
            afterCallbackDelayMs: 1000 * 60 * 60 * 6, // Once in 6 hr
        },
    },
];
