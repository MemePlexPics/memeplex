import { dateToYyyyMmDdHhMmSs } from '../index.js';

export async function updateProxyAvailability(
    mysql,
    proxy,
    protocol,
    availability,
) {
    const lastActivityDatetime = dateToYyyyMmDdHhMmSs(new Date());
    await mysql.execute(
        `
        UPDATE proxies
        SET
            availability = ?
            AND last_activity_datetime = ?
        WHERE
            address = ?
            AND protocol = ?
    `,
        [availability, proxy, protocol, lastActivityDatetime],
    );
}
