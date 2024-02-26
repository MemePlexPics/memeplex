export const getChannelSuggestions = async (mysql, page, size) => {
    const offset = (page - 1) * size;
    const [results] = await mysql.query(`
        SELECT name FROM channel_suggestions
        WHERE processed IS NOT TRUE
        LIMIT ? OFFSET ?
    `, [size, offset]);
    return results;
};
