export const getChannelsCount = async (mysql, onlyAvailable) => {
    const filter = onlyAvailable ? 'WHERE availability IS TRUE' : '';
    const [[results]] = await mysql.query(`
        SELECT COUNT(*) FROM channels
        ${filter}
    `);
    return results['COUNT(*)'];
};
