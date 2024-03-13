export async function selectChannel(mysql, name) {
    const [results] = await mysql.query(
        `
        SELECT name FROM channels
        WHERE name = ?
    `,
        [name],
    );
    return results?.[0];
}
