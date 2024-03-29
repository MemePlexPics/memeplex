import { mkdir } from 'fs/promises';

export const buildImageTextPath = async (
    { channelName, messageId, photoId },
    language,
) => {
    const directory = './data/media/' + channelName + '/';
    await mkdir(directory, { recursive: true });
    return directory + messageId + '-' + photoId + '-' + language + '.txt';
};
