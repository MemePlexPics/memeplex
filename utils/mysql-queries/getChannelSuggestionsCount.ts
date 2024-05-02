export const getChannelSuggestionsCount = async (mysql, { name }) => {
  const filters = ['processed IS NOT TRUE']
  if (name && /[0-9a-zA_Z_]+/.test(name)) filters.push(`name LIKE "%${name}%"`)

  const filterString = filters?.length ? `WHERE ${filters.join(' AND ')}` : ''
  const [[results]] = await mysql.query(`
        SELECT COUNT(*) FROM channel_suggestions
        ${filterString}
    `)
  return results['COUNT(*)']
}
