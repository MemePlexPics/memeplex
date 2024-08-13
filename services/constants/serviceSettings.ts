import { tgParser, downloader, ocr } from '..'
import { CYCLE_SLEEP_TIMEOUT } from '../../constants'
import { amqpQueueMessageCounter } from '../promtail-workers'

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
  // {
  //   name: 'proxy-checker',
  //   service: checkProxies,
  // },
  // {
  //   name: 'proxy-finder',
  //   service: findNewProxies,
  //   loopSettings: {
  //     afterCallbackDelayMs: 1000 * 60 * 60,
  //   },
  // },
  {
    name: 'promtail-workers',
    service: amqpQueueMessageCounter,
    loopSettings: {
      afterCallbackDelayMs: 1000 * 60,
    },
  },
]
