import { getMysqlClient } from '../utils/index.js';
import { createOrReplaceTable } from '../utils/mysql-queries/index.js';

const mode = 'create'; // 'replace';

const createTables = async () => {
    let mysql;
    try {
        mysql = await getMysqlClient();

        const ocr_keys = await createOrReplaceTable(mysql, mode, 'ocr_keys', `
            ocr_key VARCHAR(255) PRIMARY KEY,
            timeout DATETIME NULL
        `);
        console.log(`💬 ocr_keys table ${mode}: ${!!ocr_keys}`);

        const proxies = await createOrReplaceTable(mysql, mode, 'proxies', `
            id INT AUTO_INCREMENT PRIMARY KEY,
            address VARCHAR(64) NOT NULL,
            protocol VARCHAR(10) NOT NULL,
            availability BOOLEAN NOT NULL,
            ocr_key VARCHAR(255) NULL,
            speed INT NOT NULL,

            FOREIGN KEY (ocr_key) REFERENCES ocr_keys(ocr_key),
            UNIQUE KEY unique_address_protocol (address, protocol)
        `);
        console.log(`💬 proxies table ${mode}: ${!!proxies}`);

        const channels = await createOrReplaceTable(mysql, mode, 'channels', `
            name VARCHAR(255) PRIMARY KEY,
            langs VARCHAR(255) NOT NULL,
            availability BOOLEAN NOT NULL,
            timestamp INT NOT NULL
        `);
        console.log(`💬 channels table ${mode}: ${!!channels}`);

        const channel_suggestions = await createOrReplaceTable(mysql, mode, 'channel_suggestions', `
            name VARCHAR(255) PRIMARY KEY,
            processed BOOLEAN NULL
        `);
        console.log(`💬 channel_suggestions table ${mode}: ${!!channel_suggestions}`);

        const featured_channels = await createOrReplaceTable(mysql, mode, 'featured_channels', `
            username VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            timestamp INT NOT NULL,
            comment VARCHAR(255) NULL
        `);
        console.log(`💬 featured_channels table ${mode}: ${!!featured_channels}`);

        const phashes = await createOrReplaceTable(mysql, mode, 'phashes', `
            phash VARCHAR(255) PRIMARY KEY
        `);
        console.log(`💬 phashes table ${mode}: ${!!phashes}`);

        const bot_users = await createOrReplaceTable(mysql, mode, 'bot_users', `
            id BIGINT PRIMARY KEY,
            user VARCHAR(255) NOT NULL,
            timestamp INT NOT NULL
        `);
        console.log(`💬 bot_users table ${mode}: ${!!bot_users}`);

        const bot_actions = await createOrReplaceTable(mysql, mode, 'bot_actions', `
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT NOT NULL,
            action VARCHAR(32) NOT NULL,
            query VARCHAR(255) NULL,
            page VARCHAR(128) NOT NULL,
            timestamp INT NOT NULL,

            FOREIGN KEY (user_id) REFERENCES bot_users(id)
        `);
        console.log(`💬 bot_actions table ${mode}: ${!!bot_actions}`);
    } catch (e) {
        console.error('❌', e);
    } finally {
        mysql.end();
    }
};

await createTables();
