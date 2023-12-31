import 'dotenv/config';
import process from 'process';

// rabbitmq channel names
export const AMQP_IMAGE_DATA_CHANNEL = 'image_data';
export const AMQP_IMAGE_FILE_CHANNEL = 'image_files';
// how much time to sleep between fetching all data, ms
export const CYCLE_SLEEP_TIMEOUT = (process.env.CYCLE_SLEEP_TIMEOUT * 1) || 30_000;
// Page size for tg API calls
export const TG_API_PAGE_LIMIT = (process.env.TG_API_PAGE_LIMIT * 1) || 10;
// Rate limit for tg API calls
export const TG_API_RATE_LIMIT = (process.env.TG_API_RATE_LIMIT * 1) || 5001;
export const ELASTIC_INDEX = 'image_text';
export const MAX_SEARCH_QUERY_LENGTH = 300;
