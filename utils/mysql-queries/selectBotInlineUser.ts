export const selectBotInlineUser = async (mysql, id) => {
  const [response] = await mysql.query(
    `
        SELECT
            id
        FROM bot_inline_users
        WHERE
            id = ?
    `,
    [id],
  )
  return response
}
