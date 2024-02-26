import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export const downloadFile = async (url, dest) => {
    let response = await fetch(url);
    if (response.statusText === 'Empty message') return null;
    if (!response.ok)
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    await pipelineAsync(response.body, createWriteStream(dest));
    console.log('💬 Download completed');
    return true;
};
