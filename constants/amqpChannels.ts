import process from 'process'
import 'dotenv/config'

const postfix = process.env.ENVIRONMENT === 'TESTING' ? '_test' : ''

export const AMQP_IMAGE_DATA_CHANNEL = 'image_data' + postfix
export const AMQP_IMAGE_FILE_CHANNEL = 'image_files' + postfix
export const AMQP_CHECK_PROXY_CHANNEL = 'check_proxy' + postfix
export const AMQP_PUBLISHER_DISTRIBUTION_CHANNEL = 'publisher_distibution' + postfix
export const AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL = 'publisher_to_cryptopay' + postfix
export const AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL = 'cryptopay_to_publisher' + postfix
export const AMQP_MEMES_TO_NLP_CHANNEL = process.env.AMQP_MEMES_TO_NLP_CHANNEL + postfix
export const AMQP_NLP_TO_PUBLISHER_CHANNEL = process.env.AMQP_NLP_TO_PUBLISHER_CHANNEL + postfix
