export async function updateProxy(
    mysql,
    address,
    protocol,
    availability = false,
    speed = null,
) {
    await mysql.query(
        `
        UPDATE proxies
        SET
            availability = ?,
            speed = ?
        WHERE
            address = ?
            AND protocol = ?
    `,
        [availability, speed, address, protocol],
    );
}
