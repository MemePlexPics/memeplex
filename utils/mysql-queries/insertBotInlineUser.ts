/** Inserts a user if it's not already in the DB. Ignores duplicates */
export const insertBotInlineUser = async (mysql, id, user) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const [response] = await mysql.query(
    `
        INSERT IGNORE INTO bot_inline_users (
            id,
            user,
            timestamp
        ) VALUES (?, ?, ?)
    `,
    [id, user, timestamp],
  )
  return response.affectedRows
}
