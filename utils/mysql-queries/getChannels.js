export const getChannels = async (mysql, page, size) => {
    const offset = (page - 1) * size;
    const [results] = await mysql.query(`
        SELECT name FROM channels
        WHERE availability IS TRUE
        LIMIT ? OFFSET ?
    `, [size, offset]);
    return results;
};
