export const getFeaturedChannel = async (mysql, username) => {
    const [results] = await mysql.query(
        `
        SELECT * FROM featured_channels
        WHERE username = ?
    `,
        [username],
    );
    return results?.[0];
};
