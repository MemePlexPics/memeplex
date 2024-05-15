import amqplib from 'amqplib'
import process from 'process'
import { spawn, ChildProcess } from 'child_process'
import { AMQP_MEMES_TO_NLP_CHANNEL, AMQP_NLP_TO_PUBLISHER_CHANNEL } from '../constants'
import { delay } from '../utils'

const testCases = [
  { keywords: ['mouse'], text: 'there were mice', expected: ['mouse'] },
  { keywords: ['белая береза'], text: 'в поле виднелись белые березы', expected: ['белая береза'] },
  { keywords: ['замок'], text: 'в поле виднелись белые замки', expected: ['замок'] },
  { keywords: ['что'], text: 'а что-то случилось?', expected: ['что'] },
  { keywords: ['rat'], text: "i'd rather die!", expected: ['rat'] },
  { keywords: ['sol'], text: 'soldier hates skibidi toile...Lime Dog', expected: ['sol'] },
  {
    keywords: ['mom'],
    text: 'JAI MATADISAFE DRIVE SAVE LYPOMETAECASALKIA TO MAONEY THESTelHOOKERBANIS.',
    expected: [],
  },
  { keywords: ['bad'], text: 'worse day of my life.', expected: ['bad'] },
  { keywords: ['Брелок'], text: 'брелоки', expected: ['Брелок'] },
  { keywords: ['Дно'], text: 'донья', expected: ['Дно'] },
  { keywords: ['Шило'], text: 'шилья', expected: ['Шило'] },
  { keywords: ['Крем'], text: 'кремы', expected: ['Крем'] },
  { keywords: ['Профессор'], text: 'профессора', expected: ['Профессор'] },
  { keywords: ['Договора'], text: 'договор', expected: ['Договора'] },
  {
    keywords: ['sdhgilxdjfnlkfdjixn'],
    text: 'sdhgilxdjfnlkfdjixn',
    expected: ['sdhgilxdjfnlkfdjixn'],
  },
  { keywords: ['апрсаосапосаптса'], text: 'апрсаосапосаптса', expected: ['апрсаосапосаптса'] },
]

describe('NLP Matching', () => {
  let connection: amqplib.Connection
  let channel: amqplib.Channel
  let responseChannel: amqplib.Channel
  let pythonProcess: ChildProcess

  beforeAll(async () => {
    connection = await amqplib.connect(process.env.AMQP_ENDPOINT)
    channel = await connection.createChannel()
    responseChannel = await connection.createChannel()
    await responseChannel.assertQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL, { durable: true })

    pythonProcess = spawn('./.venv/bin/python', ['./utils/lemmatizer.py'])
    // Give lemmatizer.py some time to wake up
    await delay(5_000)
  }, 10_000)

  beforeEach(async () => {
    await channel.purgeQueue(AMQP_MEMES_TO_NLP_CHANNEL)
    await responseChannel.purgeQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL)
  })

  afterAll(async () => {
    pythonProcess.kill()
    await channel.deleteQueue(AMQP_MEMES_TO_NLP_CHANNEL)
    await responseChannel.deleteQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL)
    await channel.close()
    await responseChannel.close()
    await connection.close()
  })

  testCases.forEach(({ keywords, text, expected }) => {
    test(`should return «${expected}» for keywords: [${keywords}] and text: «${text}»`, async () => {
      channel.sendToQueue(
        AMQP_MEMES_TO_NLP_CHANNEL,
        Buffer.from(JSON.stringify({ memeId: 'test_meme', keywords, memeData: { eng: text } })),
        { persistent: true },
      )

      const msg = await responseChannel.get(AMQP_NLP_TO_PUBLISHER_CHANNEL)
      if (msg) {
        const response = JSON.parse(msg.content.toString())
        responseChannel.ack(msg)
        expect(response.matchedKeywords).toStrictEqual(expected)
      }
    })
  })
})
