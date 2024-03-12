export const getChannels = async (mysql, page, size, filters) => {
    const offset = (page - 1) * size;
    const [results] = await mysql.query(`
        SELECT name, availability FROM channels
        ${filters?.length
            ? `WHERE ${filters.join(' AND ')}`
            : ''
        }
        ORDER BY availability DESC
        LIMIT ? OFFSET ?
    `, [size, offset]);
    return results;
};
