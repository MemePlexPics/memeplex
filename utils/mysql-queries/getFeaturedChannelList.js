export const getFeaturedChannelList = async (mysql) => {
    const [results] = await mysql.query(`
        SELECT username, title FROM featured_channels
        WHERE timestamp >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    `);
    return results;
};
