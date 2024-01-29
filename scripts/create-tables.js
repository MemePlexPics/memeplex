import { getMysqlClient } from '../src/utils.js';

const createTables = async () => {
    let mysql;
    try {
        mysql = await getMysqlClient();

        await mysql.query(`
            CREATE OR REPLACE TABLE ocr_keys (
                ocr_key VARCHAR(255) PRIMARY KEY,
                timeout DATETIME NULL
            )
        `);
        console.log('💬 ocr_keys table created');

        await mysql.query(`
            CREATE OR REPLACE TABLE proxies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                address VARCHAR(64) NOT NULL,
                protocol VARCHAR(10) NOT NULL,
                availability BOOLEAN NOT NULL,
                ocr_key VARCHAR(255) NULL,
                speed INT NOT NULL,

                FOREIGN KEY (ocr_key) REFERENCES ocr_keys(ocr_key),
                UNIQUE KEY unique_address_protocol (address, protocol)
            )
        `);
        console.log('💬 proxies table created');

        await mysql.query(`
            CREATE OR REPLACE TABLE channels (
                name VARCHAR(255) PRIMARY KEY,
                langs VARCHAR(255) NOT NULL,
                availability BOOLEAN NOT NULL,
                timestamp INT NOT NULL
            )
        `);
        console.log('💬 ocr_keys table created');

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
