export async function setProxyAvailability(mysql, proxy, protocol, availability) {
    await mysql.execute(`
        UPDATE proxies
        SET availability = ?
        WHERE
            address = ?
            AND protocol = ?
    `, [availability, proxy, protocol]);
}
