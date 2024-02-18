export const getTgChannelName = (link) => link
    .replace('https://t.me/', '')
    .replace('@', '');
