export const insertBotAction = async (mysql, user_id, action, query, page) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const [response] = await mysql.query(
    `
        INSERT INTO bot_actions (
            user_id,
            action,
            query,
            page,
            timestamp
        ) VALUES (?, ?, ?, ?, ?)
    `,
    [user_id, action, query, page, timestamp],
  )
  return response.affectedRows
}
