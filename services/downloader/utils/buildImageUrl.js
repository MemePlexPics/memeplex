import 'dotenv/config';
import process from 'process';

export const buildImageUrl = ({ channelName, messageId, photoId }) => {
    return process.env.TG_RSS_ENDPOINT + '/media/' + channelName + '/'
        + messageId + '/' + photoId + '_x_0.jpg';
};
