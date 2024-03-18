export async function insertProxy(
    mysql,
    address,
    protocol,
    availability,
    anonimity,
    speed,
    lastActivityDatetime,
) {
    await mysql.query(
        `
        INSERT IGNORE INTO proxies (
            address,
            protocol,
            availability,
            anonimity,
            speed,
            last_activity_datetime,
            last_check_datetime
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        [
            address,
            protocol,
            availability,
            anonimity,
            speed,
            lastActivityDatetime,
            lastActivityDatetime,
        ],
    );
}
