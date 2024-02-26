import 'dotenv/config';
import * as readline from 'readline';
import process from 'process';

import { getElasticClient } from '../utils/index.js';
import { ELASTIC_PAGE_SIZE } from '../constants/index.js';
import { searchMemes } from '../services/servers/utils/index.js';

const client = await getElasticClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    const res = await searchMemes(client, line, 1, ELASTIC_PAGE_SIZE);
    console.log(res);
});

rl.once('close', () => {
    console.log('bye!');
});
