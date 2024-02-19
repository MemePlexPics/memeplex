import process from 'process';

export const getTelegramChatInfo = async (name) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=@${name}`;
    const chatInfo = await fetch(url);
    return await chatInfo.json();
};
