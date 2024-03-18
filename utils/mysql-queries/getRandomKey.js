export async function getRandomKey(mysql) {
    const [results] = await mysql.execute(`
        SELECT
            ocr_key,
            timeout
        FROM ocr_keys
        WHERE
            timeout IS NULL
            OR timeout > DATE_ADD(NOW(), INTERVAL 55 MINUTE)
        ORDER BY
            RAND()
        LIMIT 1
    `);
    return results;
}
