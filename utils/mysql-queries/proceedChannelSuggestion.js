export const proceedChannelSuggestion = async (mysql, channel) => {
    await mysql.execute(`
        UPDATE channel_suggestions
        SET processed = 1
        WHERE name = ?
    `, [channel]);
};
