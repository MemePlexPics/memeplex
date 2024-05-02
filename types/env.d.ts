declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TG_API_ENDPOINT: string
      TG_RSS_ENDPOINT: string
      OCR_SPACE_API_KEYS: string
      OCR_SPACE_API_KEYS_PRO: string
      CYCLE_SLEEP_TIMEOUT: number
      ELASTIC_ENDPOINT: string
      ELASTIC_USERNAME: string
      ELASTIC_PASSWORD: string
      AMQP_ENDPOINT: string
      TELEGRAM_API_ID: string
      TELEGRAM_API_HASH: string
      TELEGRAM_BOT_TOKEN: string
      TELEGRAM_BOT_WEBHOOK_PATH: string
      TELEGRAM_PUBLISHER_BOT_TOKEN: string
      TELEGRAM_PUBLISHER_BOT_WEBHOOK_PATH: string
      CRYPTOPAY_BOT_TEST_TOKEN: string
      CRYPTOPAY_BOT_TEST_WEBHOOK_PATH: string
      MEMEPLEX_WEBSITE_DOMAIN: string
      MEMEPLEX_ADMIN_PASSWORD: string
      MEMEPLEX_MODERATOR_PASSWORD: string
      GF_SECURITY_ADMIN_PASSWORD: string
      GF_SECURITY_ADMIN_USER: string
      GF_AUTH_ANONYMOUS_ENABLED?: boolean
      GF_AUTH_ANONYMOUS_ORG_ROLE?: string
      GF_AUTH_DISABLE_LOGIN_FORM?: boolean
      DB_HOST: string
      DB_PORT: number
      DB_USER: string
      DB_PASSWORD: string
      DB_DATABASE: string
    }
  }
}

export {}
