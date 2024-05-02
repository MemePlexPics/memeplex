export const selectBotUser = async (mysql, id) => {
  const [response] = await mysql.query(
    `
        SELECT
            id
        FROM bot_users
        WHERE
            id = ?
    `,
    [id],
  )
  return response
}
