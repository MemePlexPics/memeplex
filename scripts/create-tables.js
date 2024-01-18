import { getMysqlClient } from '../src/utils.js';

const createTables = async () => {
    let mysql;
    try {
        mysql = await getMysqlClient();

        await mysql.query(`
            CREATE OR REPLACE TABLE ocr_keys (
                ocr_key VARCHAR(255) PRIMARY KEY,
                timeout DATETIME
            )
        `);
        console.log('💬 ocr_keys table created');

        await mysql.query(`
            CREATE OR REPLACE TABLE proxies (
                address VARCHAR(255) PRIMARY KEY,
                availability BOOLEAN,
                ocr_key VARCHAR(255),
                speed INT NULL
            )
        `);
        console.log('💬 proxies table created');

        await mysql.query(`
            CREATE OR REPLACE TABLE phashes (
                phash VARCHAR(255) PRIMARY KEY
            )
        `);
        console.log('💬 phashes table created');
    } catch (e) {
        console.error('❌', e);
    } finally {
        mysql.end();
    }
};

await createTables();
