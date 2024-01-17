import process from 'process';

import { getMysqlClient } from '../src/utils.js';

async function insertKey(connection, key) {
    try {
        await connection.execute('INSERT INTO ocr_keys (ocr_key) VALUES (?)', [key]);
        console.log(`💬 Inserted OCR key: ${key}`);
    } catch (error) {
        // If the key already exists, ignore the error
        if (error.code !== 'ER_DUP_ENTRY') {
            throw error;
        }
    }
}

export const inserOcrKeysToDb = async () => {
    const mysql = await getMysqlClient();

    const keys = process.env.OCR_SPACE_API_KEYS.split(',');

    try {
        for (const key of keys) {
            await insertKey(mysql, key.trim());
        }
    } finally {
        await mysql.end();
    }
};

await inserOcrKeysToDb();
