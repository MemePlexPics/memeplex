export const getChannelSuggestionsCount = async (mysql) => {
    const [[results]] = await mysql.query(`
        SELECT COUNT(*) FROM channel_suggestions
        WHERE processed IS NOT TRUE
    `);
    return results['COUNT(*)'];
};
