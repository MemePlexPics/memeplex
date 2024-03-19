import { delay, getMysqlClient, getDateUtc } from '../../../utils/index.js';
import { saveKeyTimeout } from '../../../utils/mysql-queries/index.js';

export const handleTimeout = async (apiKey, timeout, logger) => {
    const utcNow = getDateUtc();
    const delayMs = Math.max(0, new Date(timeout) - utcNow);
    const mysql = await getMysqlClient({ connectTimeout: delayMs + 5_000 });
    if (delayMs > 0) {
        logger.info(
            `💬 Key timeout: ${timeout}. Wait ${delayMs / 1000} seconds`,
        );
        await delay(delayMs);
    }
    await saveKeyTimeout(mysql, apiKey, null);
    mysql.close();
};
