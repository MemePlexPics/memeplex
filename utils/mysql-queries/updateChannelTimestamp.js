export async function updateChannelTimestamp(mysql, name, timestamp) {
    await mysql.query(`
        UPDATE channels
        SET timestamp = ?
        WHERE name = ?
    `, [timestamp, name]);
}
