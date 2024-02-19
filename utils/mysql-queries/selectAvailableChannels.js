export async function selectAvailableChannels(mysql) {
    const [results] = await mysql.query(`
        SELECT
            name,
            langs,
            timestamp
        FROM channels
        WHERE availability IS TRUE
    `);
    return results;
}
