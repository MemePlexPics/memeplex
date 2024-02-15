import { mkdir } from 'fs/promises';

export const buildImagePath = async ({ channelName, messageId, photoId }) => {
    const directory = './data/media/' + channelName + '/';
    await mkdir(directory, { recursive: true });
    return directory + messageId + '-' + photoId + '.jpg';
};
