import { delay, getMysqlClient, getDateUtc } from '../../../utils/index.js';
import { saveKeyTimeout } from '../../../utils/mysql-queries/index.js';

export const handleTimeout = async (apiKey, timeout, logger) => {
    const mysql = await getMysqlClient();
    const utcNow = getDateUtc();
    const delayMs = Math.max(0, new Date(timeout) - utcNow);
    if (delayMs !== 0) {
        logger.info(
            `💬 Key timeout: ${timeout}. Wait ${delayMs / 1000} seconds`,
        );
        logger.error('There are no keys without timeout');
        await delay(delayMs);
    }
    await saveKeyTimeout(mysql, apiKey, null);
};
