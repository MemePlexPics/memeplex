export const insertChannelSuggestion = async (mysql, name) => {
    await mysql.query(`
        INSERT IGNORE INTO channel_suggestions (name) VALUES (?)
    `, [name]);
};
