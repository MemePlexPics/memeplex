export const getChannelsCount = async (mysql) => {
    const [[results]] = await mysql.query(`
        SELECT COUNT(*) FROM channels
        WHERE availability IS TRUE
    `);
    return results['COUNT(*)'];
};
