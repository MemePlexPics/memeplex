export async function getRandomKey(mysql) {
    const [results] = await mysql.execute(`
        SELECT
            ocr_key,
            timeout
        FROM ocr_keys
        ORDER BY
            CASE 
                WHEN timeout IS NULL THEN RAND()
                ELSE timeout
            END
        LIMIT 1
    `);
    return results;
}
