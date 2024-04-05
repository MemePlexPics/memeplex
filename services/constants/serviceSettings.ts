import { tgParser, downloader, ocr, checkProxies } from '..'
import { CYCLE_SLEEP_TIMEOUT } from '../../constants'
import { amqpQueueMessageCounter } from '../promtail-workers'
import { findNewProxies } from '../utils'

export const serviceSettings = [
  {
    name: 'tg-parser',
    service: tgParser,
    loopSettings: {
      afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    },
  },
  {
    name: 'downloader',
    service: downloader,
  },
  {
    name: 'ocr',
    service: ocr,
  },
  {
    name: 'proxy-checker',
    service: checkProxies,
  },
  {
    name: 'proxy-finder',
    service: findNewProxies,
    loopSettings: {
      afterCallbackDelayMs: 1000 * 60 * 60,
    },
  },
  {
    name: 'promtail-workers',
    service: amqpQueueMessageCounter,
    loopSettings: {
      afterCallbackDelayMs: 10_000,
    },
  },
]
