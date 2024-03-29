import {
    getTelegramChatInfo,
    getTelegramFileInfo,
    downloadTelegramFile,
} from '.';

export const downloadTelegramChannelAvatar = async (channelName) => {
    const chatInfo = await getTelegramChatInfo(channelName);
    const photo_id = chatInfo?.result?.photo?.small_file_id;
    if (photo_id) {
        const fileInfo = await getTelegramFileInfo(photo_id);
        const file_path = fileInfo.result.file_path;
        if (file_path) {
            const destination = await downloadTelegramFile(
                channelName,
                file_path,
            );
            if (destination) return destination;
            else {
                return false;
            }
        }
    }
    return null;
};
