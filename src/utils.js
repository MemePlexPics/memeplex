import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import mysql from 'mysql2/promise';
import process from 'process';
import  { performance } from 'perf_hooks';
import axios from 'axios';
import { promises as fs } from 'fs';

import { PROXY_TEST_TIMEOUT, PROXY_TESTING_FILE } from './const.js';
import { getProxyForKey, getRandomKey } from './mysql-queries.js';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

export const getMysqlClient = async () => {
    // TODO: fix credentials
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

export async function loopRetrying(
    callback,
    options = {
        logger: undefined,
        catchDelayMs: 0,
        delayMs: 0,
        afterErrorCallback: async () => {},
    }) {
    for (;;) {
        try {
            const result = await callback();
            if (result) break;
        } catch (e) {
            logError(options.logger, e);
            if (options.catchDelayMs) await delay(options.catchDelayMs);
            await options?.afterErrorCallback?.();
        } finally {
            if (options.delayMs) await delay(options.delayMs);
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
    if (!finallKeyData.proxy)
        throw new Error(`❌ Proxy for ${finallKeyData.key} isn't finded`);
    
    console.log(`💬 ${finallKeyData.key} ${finallKeyData.proxy} ${findedProxy.speed}ms`);
    return finallKeyData;
}

export const getProxySpeed = async (ip, port) => {
    const proxy = `${ip}:${port}`;
    try {
        const start = performance.now();
        const response = await axios.get(PROXY_TESTING_FILE, {
            timeout: PROXY_TEST_TIMEOUT,
            proxy: {
                host: ip,
                port
            }
        });
        const end = performance.now();

        if (response.status != 200)
            throw new Error(`status ${response.status}`, response?.data);

        const speed = parseInt(end - start);
        console.log(`✅ Proxy ${proxy} is working. Speed: ${speed}ms`);

        return speed;
    } catch (error) {
        console.log(`❌ Proxy ${proxy} is not working. Error: ${error.message}`);
        return;
    }
};
