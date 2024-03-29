import { OCR_SPACE_403_DELAY } from '../../constants';

export async function getRandomKey(mysql) {
    const [results] = await mysql.execute(
        `
        SELECT
            ocr_key,
            timeout
        FROM ocr_keys
        WHERE
            timeout IS NULL
            OR timeout < DATE_ADD(NOW(), INTERVAL ? MICROSECOND)
        ORDER BY
            RAND()
        LIMIT 1
    `,
        [OCR_SPACE_403_DELAY],
    );
    return results;
}
