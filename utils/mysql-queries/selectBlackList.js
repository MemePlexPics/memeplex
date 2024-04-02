export async function selectBlackList(mysql) {
    const [response] = await mysql.query('SELECT words FROM words_blacklist');
    if (!response.length)
        throw new Error(
            'There is no blacklist in the database. Please add them to the words cell from the words_blacklist table (one row, separated by lines)',
        );
    return response[0].words;
}
