import process from 'process';

import { getMysqlClient } from '../../utils/index.js';

// TODO: move
async function insertKeys(connection, keys) {
    const keyValues = [keys.map(key => [key])];
    const [ResultSetHeader] = await connection.query('INSERT IGNORE INTO ocr_keys (ocr_key) VALUES ?', keyValues);
    console.log(`💬 Inserted ${ResultSetHeader.affectedRows} OCR keys`);
}

export const insertOcrKeysIntoDb = async () => {
    const mysql = await getMysqlClient();

    const keys = process.env.OCR_SPACE_API_KEYS.split(',');
    if (typeof keys === 'undefined') {
        throw 'specify OCR_SPACE_API_KEYS, a comma-separated list of ocs.space keys';
    }

    try {
        const keysTrimmed = keys.map(key => key.trim());
        await insertKeys(mysql, keysTrimmed);
    } finally {
        await mysql.end();
    }
};
