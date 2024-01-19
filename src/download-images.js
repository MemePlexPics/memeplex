/* global Buffer */
import 'dotenv/config';
import process from 'process';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { loopRetrying } from './utils.js';
import { LOOP_RETRYING_DELAY } from './const.js';

export const buildImageUrl = ({ channelName, messageId, photoId }) => {
    return process.env.TG_RSS_ENDPOINT + '/media/' + channelName + '/'
        + messageId + '/' + photoId + '_x_0.jpg';
};

export const buildImagePath = async ({ channelName, messageId, photoId }) => {
    const directory = './data/media/' + channelName + '/';
    await mkdir(directory, { recursive: true });
    return directory + messageId + '-' + photoId + '.jpg';
};

const pipelineAsync = promisify(pipeline);

export async function downloadFile(url, dest, logger) {
    let response;
    await loopRetrying(async () => {
        response = await fetch(url);
        return true;
    }, {
        logger,
        catchDelayMs: LOOP_RETRYING_DELAY,
    });
    if (!response.ok)
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    await pipelineAsync(response.body, createWriteStream(dest));
    console.log('💬 Download completed');
}
