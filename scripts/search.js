import 'dotenv/config';
import * as readline from 'readline';
import process from 'process';

import { getElasticClient, buildElasticQuery } from '../utils/index.js';

const client = await getElasticClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    const query = buildElasticQuery(line);
    const res = await client.search(query);

    for (const hit of res.hits.hits) {
        console.log(hit._source);
    }
});

rl.once('close', () => {
    console.log('bye!');
});
