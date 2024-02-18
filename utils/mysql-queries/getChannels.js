export const getChannels = async (mysql, page, onlyAvailable, size) => {
    const filter = onlyAvailable ? 'WHERE availability IS TRUE' : '';
    const offset = (page - 1) * size;
    const [results] = await mysql.query(`
        SELECT name, availability FROM channels
        ${filter}
        LIMIT ? OFFSET ?
    `, [size, offset]);
    return results;
};
