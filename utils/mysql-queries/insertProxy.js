export async function insertProxy(mysql, address, protocol, availability, speed = null) {
    await mysql.query(`
        INSERT INTO proxies (
            address,
            protocol,
            availability,
            speed
        ) VALUES (?, ?, ?, ?)
    `, [address, protocol, availability, speed]);
}
