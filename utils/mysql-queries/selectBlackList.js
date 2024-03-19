export async function selectBlackList(mysql) {
    const [response] = await mysql.query('SELECT words FROM words_blacklist');
    if (!response.length) return null;
    return response[0].words;
};
