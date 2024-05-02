export async function findExistedProxy(mysql, proxy, protocol) {
  const [results] = await mysql.query(
    `
        SELECT id FROM proxies
        WHERE
            address = ?
            AND protocol = ?
        `,
    [proxy, protocol],
  )
  if (results.length) return results[0]
  return
}
