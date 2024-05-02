export async function linkKeyToProxy(mysql, key, proxy, protocol) {
  await mysql.query(
    `
        UPDATE proxies
        SET ocr_key = ?
        WHERE
            address = ?
            AND protocol = ?
    `,
    [key, proxy, protocol],
  )
  console.log(`💬 Proxy ${proxy} (${protocol}) was linked to key ${key}`)
}
