export const removeFeaturedChannel = async (mysql, name) => {
  const [results] = await mysql.query(
    `
        DELETE FROM featured_channels
        WHERE username = ?
    `,
    [name],
  )
  return results?.[0]
}
