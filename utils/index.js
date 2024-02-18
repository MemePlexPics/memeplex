import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import mysql from 'mysql2/promise';
import process from 'process';
import  { performance } from 'perf_hooks';
import axios from 'axios';
import { promises as fs } from 'fs';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { PROXY_TEST_TIMEOUT, PROXY_TESTING_FILE } from '../constants/index.js';
import { getProxyForKey, getRandomKey } from '../utils/mysql-queries/index.js';
import { InfoMessage } from './custom-errors.js';

export { InfoMessage } from './custom-errors.js';
export { getTgChannelName } from './getTgChannelName.js';

// TODO: split into files?
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getMysqlClient = async () => {
    const client = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    return client;
};

export const getElasticClient = () => {
    const client = new Client({
        node: process.env.ELASTIC_ENDPOINT,
        auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        },
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
};

export const connectToElastic = async (logger) => {
    const getElasticClientUntilSuccess = async () => {
        let connect;
        await loopRetrying(async () => {
            connect = getElasticClient();
            return true;
        }, { logger });
        return connect;
    };

    let client = await getElasticClientUntilSuccess();

    const reconnect = async () => {
        client = await getElasticClientUntilSuccess();
    };

    return {
        client,
        reconnect,
    };
};

export async function checkFileExists(file) {
    try {
        await fs.access(file);
        return true; // The file exists
    } catch {
        return false; // The file does not exist
    }
}

export async function logError(logger, e) {
    if (logger) {
        logger.error({
            error: e.name,
            message: e.message,
            stack: e.stack,
        });
        return;
    }
    console.error('❌', e);
}

export async function logInfo(logger, e) {
    if (logger) {
        logger.info({
            error: e.name,
            message: e.message,
            stack: e.stack,
        });
        return;
    }
    console.info('❌', e);
}

export async function loopRetrying(
    callback,
    options = {
        logger: undefined,
        catchDelayMs: 0,
        afterCallbackDelayMs: 0,
        afterErrorCallback: async () => {},
    }) {
    for (;;) {
        try {
            const result = await callback();
            if (options.afterCallbackDelayMs)
                await delay(options.afterCallbackDelayMs);
            if (result) break;
        } catch (e) {
            if (e instanceof InfoMessage) logInfo(options.logger, e);
            else logError(options.logger, e);
            if (options.catchDelayMs) await delay(options.catchDelayMs);
            await options?.afterErrorCallback?.();
        }
    }
}

function getRandomElement(arr) {
    if (arr && arr.length) {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    return null;
}

export function getDateUtc() {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcNow;
}

export function dateToYyyyMmDdHhMmSs(date) {
    return new Date(date)
        .toISOString()
        .slice(0,19)
        .replace('T', ' ');
}

export async function chooseRandomOCRSpaceKey () {
    const mysql = await getMysqlClient();
    // Select a random key without timeout or with the early date
    const keys = await getRandomKey(mysql);
    const keyData = keys[0];
    const finallKeyData = {
        key: keyData.ocr_key,
        timeout: keyData.timeout,
    };
    const findedProxy = await getProxyForKey(mysql, keyData.ocr_key);
    if (!findedProxy)
        throw new Error('There are no available free proxies');
    finallKeyData.proxy = findedProxy.address;
    finallKeyData.protocol = findedProxy.protocol;
    if (!finallKeyData.proxy)
        throw new Error(`❌ Proxy for ${finallKeyData.key} isn't finded`);

    console.log(`💬 ${finallKeyData.key} ${finallKeyData.proxy} (${finallKeyData.protocol}) ${findedProxy.speed}ms`);
    return finallKeyData;
}

export const getProxySpeed = async (ip, port, protocol, repeats = 1, logger) => {
    const proxy = `${ip}:${port}`;
    const requestOptions = {
        timeout: PROXY_TEST_TIMEOUT,
    };
    try {
        if (protocol === 'http') {
            requestOptions.proxy = {
                host: ip,
                port
            };
        } else {
            requestOptions.httpAgent = new SocksProxyAgent(`socks://${proxy}`, { protocol });
        }
        const axiosClient = axios.create(requestOptions);
        const measuredSpeeds = [];
        for (let i = 0; i < repeats; i++) {
            const start = performance.now();
            const response = await axiosClient.get(PROXY_TESTING_FILE);
            const end = performance.now();

            if (response.status != 200)
                throw new Error(`status ${response.status}`, response?.data);

            measuredSpeeds.push(end - start);
        }
        const speed = measuredSpeeds.reduce((acc, speed) => acc + speed, 0) / repeats;
        const roundedSpeed = parseInt(speed);
        logger.verbose(`✅ Proxy ${proxy} (${protocol}) is working. Average response time: ${roundedSpeed}ms`);

        return roundedSpeed;
    } catch (error) {
        logger.verbose(`❌ Proxy ${proxy} (${protocol}) is not working. Error: ${error.message}`);
        return;
    }
};
