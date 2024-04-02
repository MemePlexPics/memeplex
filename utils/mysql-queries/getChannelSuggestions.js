export const getChannelSuggestions = async (mysql, page, size, { name }) => {
    const filters = ['processed IS NOT TRUE'];
    const offset = (page - 1) * size;
    if (name && /[0-9a-zA_Z_]+/.test(name))
        filters.push(`name LIKE "%${name}%"`);

    const filterString = filters?.length
        ? `WHERE ${filters.join(' AND ')}`
        : '';
    const [results] = await mysql.query(
        `
        SELECT name FROM channel_suggestions
        ${filterString}
        LIMIT ? OFFSET ?
    `,
        [size, offset],
    );
    return results;
};
