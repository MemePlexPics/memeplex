import 'dotenv/config';
import process from 'process';

// rabbitmq channel names
export const AMQP_IMAGE_DATA_CHANNEL = 'image_data';
export const AMQP_IMAGE_FILE_CHANNEL = 'image_files';
// how much time to sleep between fetching all data, ms
export const CYCLE_SLEEP_TIMEOUT = (process.env.CYCLE_SLEEP_TIMEOUT * 1) || 30_000;
export const OCR_SPACE_403_DELAY = 20_000; // 3600 / 180, the limit is 180 per hour
// Page size for tg API calls
export const TG_API_PAGE_LIMIT = (process.env.TG_API_PAGE_LIMIT * 1) || 10;
// Rate limit for tg API calls
export const TG_API_RATE_LIMIT = (process.env.TG_API_RATE_LIMIT * 1) || 5001;
export const ELASTIC_INDEX = 'image_text';
export const ELASTIC_FUZZINESS = 2;
export const ELASTIC_PAGE_SIZE = 20;
export const MAX_SEARCH_QUERY_LENGTH = 300;
// Delay time for the loopRetrying() after an error is catched
export const LOOP_RETRYING_DELAY = 5_000;
// AMQP queue delay time for recheck after empty queue
export const EMPTY_QUEUE_RETRY_DELAY = 10_000;
// Max proxy speed test wait time
export const PROXY_TEST_TIMEOUT = 5_000;
// Must be http (because many proxies don't support SSL)
export const PROXY_TESTING_FILE = 'http://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png';
// API to get list of free proxy servers
export const PROXY_LIST_API_URL = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=ipport&format=json';