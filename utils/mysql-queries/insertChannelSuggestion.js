/** Inserts a suggestion if it's not already in the channels. Ignores duplicates */
export const insertChannelSuggestion = async (mysql, name) => {
    const [response] = await mysql.query(`
        INSERT IGNORE INTO channel_suggestions (name)
        SELECT ?
        FROM dual
        WHERE NOT EXISTS (
            SELECT 1 
            FROM channels 
            WHERE LOWER(name) = LOWER(?)
        )
    `, [name, name]);
    return response.affectedRows;
};
