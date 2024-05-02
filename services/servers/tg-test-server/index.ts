import TelegramServer from 'telegram-test-api'

const server = new TelegramServer({ port: 9000 })
await server.start()
