import process from 'process'

export { PROXY_LIST_API_URLS } from './PROXY_LIST_API_URLS'
export { OCR_SPACE_PRO_API_USA } from './OCR_SPACE_PRO_API'
export { OCR_SPACE_PRO_API_EU } from './OCR_SPACE_PRO_API'
export { fuseOptions } from './fuseOptions'

// TODO: split into files?
// rabbitmq channel names
export const AMQP_IMAGE_DATA_CHANNEL = 'image_data'
export const AMQP_IMAGE_FILE_CHANNEL = 'image_files'
export const AMQP_CHECK_PROXY_CHANNEL = 'check_proxy'
export const AMQP_PUBLISHER_DISTRIBUTION_CHANNEL = 'publisher_distibution'
// how much time to sleep between fetching all data, ms
export const CYCLE_SLEEP_TIMEOUT = (Number(process.env.CYCLE_SLEEP_TIMEOUT) * 1) || 30_000
export const OCR_SPACE_403_DELAY = 1_800_000 // 3600 / 180, the limit is 180 per hour
// Page size for tg API calls
export const TG_API_PAGE_LIMIT = (Number(process.env.TG_API_PAGE_LIMIT) * 1) || 10
// Rate limit for tg API calls
export const TG_API_RATE_LIMIT = (Number(process.env.TG_API_RATE_LIMIT) * 1) || 5001
// Start parse from date for tg API calls
export const TG_API_PARSE_FROM_DATE = (Date.now()/1000 - 24 * 3600) | 0 // From 1 days ago
export const ELASTIC_INDEX = 'image_text'
export const ELASTIC_FUZZINESS = 1
export const ELASTIC_PAGE_SIZE = 20
export const MAX_SEARCH_QUERY_LENGTH = 300
// Page size for /serach handler
export const SEARCH_PAGE_SIZE = 60
// Page size for Telegram bot
export const TG_BOT_PAGE_SIZE = 5
export const TG_INLINE_BOT_PAGE_SIZE = 50 // Telegram works bad with higher numbers
// Page size for /getChannelList handler
export const CHANNEL_LIST_PAGE_SIZE = 100
// Delay time for the loopRetrying() after an error is catched
export const LOOP_RETRYING_DELAY = 5_000
// AMQP queue delay time for recheck after empty queue
export const EMPTY_QUEUE_RETRY_DELAY = 10_000
// Max proxy speed test wait time
export const PROXY_TEST_TIMEOUT = 5_000
// Must be http (because many proxies don't support SSL)
export const PROXY_TESTING_FILE = 'http://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png'
// Available OCR languages
export const OCR_LANGUAGES = ['eng', 'rus']
