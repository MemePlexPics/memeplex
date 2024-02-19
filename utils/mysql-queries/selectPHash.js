export async function selectPHash(mysql, pHash) {
    const [results] = await mysql.query(`
        SELECT phash FROM phashes
        WHERE phash = ?
        LIMIT 1
    `, pHash);
    return results?.[0];
}
