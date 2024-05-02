export async function updateProxy(
  mysql,
  address,
  protocol,
  availability,
  anonymity,
  speed,
  lastCheckDatetime,
) {
  await mysql.query(
    `
        UPDATE proxies
        SET
            availability = ?,
            speed = ?,
            anonymity = ?,
            last_check_datetime = ?
        WHERE
            address = ?
            AND protocol = ?
    `,
    [availability, speed, anonymity, lastCheckDatetime, address, protocol],
  )
}
