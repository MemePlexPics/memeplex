export async function updateProxy(
    mysql,
    address,
    protocol,
    availability,
    anonimity,
    speed,
    lastCheckDatetime,
) {
    await mysql.query(
        `
        UPDATE proxies
        SET
            availability = ?,
            speed = ?,
            anonimity = ?,
            last_check_datetime = ?
        WHERE
            address = ?
            AND protocol = ?
    `,
        [availability, speed, anonimity, lastCheckDatetime, address, protocol],
    );
}
