export const getTelegramUser = (from) => {
    const { id, username, first_name, last_name } = from;
    return {
        id,
        user: username ? '@' + username : [first_name, last_name].join(' '),
    };
};
