export async function insertChannel(
    mysql,
    name,
    langs,
    availability,
    timestamp,
) {
    await mysql.query(
        `
        INSERT INTO channels (
            name,
            langs,
            availability,
            timestamp
        ) VALUES (?, ?, ?, ?)
    `,
        [name, langs, availability, timestamp],
    );
}
