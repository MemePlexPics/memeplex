import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import process from 'process';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

export const getElasticClient = () => {
    const client = new Client({
        node: process.env.ELASTIC_ENDPOINT,
        auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        },
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
};
