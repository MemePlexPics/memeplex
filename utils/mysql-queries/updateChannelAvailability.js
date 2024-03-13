export async function updateChannelAvailability(mysql, name, availability) {
    await mysql.query(
        `
        UPDATE channels
        SET availability = ?
        WHERE name = ?
    `,
        [availability, name],
    );
}
