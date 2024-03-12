export const getChannelsCount = async (mysql, filters) => {
    const [[results]] = await mysql.query(`
        SELECT COUNT(*) FROM channels
        ${filters?.length
            ? `WHERE ${filters.join(' AND ')}`
            : ''
        }
    `);
    return results['COUNT(*)'];
};
