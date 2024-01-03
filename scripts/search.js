import 'dotenv/config';
import {
    ELASTIC_INDEX
} from '../src/const.js';
import { getElasticClient } from '../src/utils.js';
import { buildElasticQuery } from '../src/elastic.js';
import * as readline from 'readline';
import process from 'process';

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
