export const removeChannel = async (mysql, name) => {
    const [results] = await mysql.query(`
        DELETE FROM channels
        WHERE name = ?
    `, [name]);
    return results?.[0];
};
