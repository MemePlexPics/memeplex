import 'dotenv/config';
import {
    ELASTIC_INDEX
} from './const.js';
import { getElasticClient } from './utils.js';
import * as readline from 'readline';
import process from 'process';

const client = await getElasticClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    const res = await client.search({
        index: ELASTIC_INDEX,
        query: {
            match: {
                eng: line,
            }
        }
    });

    for (const hit of res.hits.hits) {
        console.log(hit._source);
    }
});

rl.once('close', () => {
    console.log('bye!');
});
