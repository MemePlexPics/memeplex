export async function saveKeyTimeout(mysql, key, timeout) {
    await mysql.query(
        `
        UPDATE ocr_keys
        SET timeout = ?
        WHERE ocr_key = ?
    `,
        [timeout, key],
    );
    console.log(`💬 For key ${key} was set timeout ${timeout}`);
}
