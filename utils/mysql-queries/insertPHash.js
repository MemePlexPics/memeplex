export async function insertPHash(mysql, pHash) {
    await mysql.query('INSERT INTO phashes (phash) VALUES (?)', pHash);
}
