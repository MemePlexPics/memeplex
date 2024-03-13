import process from 'process';
import { downloadFile } from '../../../utils/index.js';

export const downloadTelegramFile = async (channel, file_path) => {
    const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file_path}`;
    const destination = `./data/avatars/${channel}.jpg`;
    const isDownloaded = await downloadFile(url, destination);
    if (!isDownloaded) return null;
    return destination;
};
