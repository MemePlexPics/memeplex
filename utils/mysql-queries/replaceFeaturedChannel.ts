export async function replaceFeaturedChannel(mysql, username, title, comment, timestamp) {
  const [response] = await mysql.query(
    `
        REPLACE INTO featured_channels (
            username,
            title,
            comment,
            timestamp
        ) VALUES (?, ?, ?, ?)
    `,
    [username, title, comment, timestamp],
  )
  return response.affectedRows
}
