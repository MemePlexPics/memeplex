type TPayUrl = `https://t.me/${'CryptoBot' | 'CryptoTestnetBot'}?start=${TBaseInvoice['hash']}`

/** Such as 'USDT', 'TON', 'BTC', 'ETH' */
type TAsset = string

type TBaseInvoice = {
  invoice_id: number
  hash: string
  amount: string
  bot_invoice_url: TPayUrl
  description?: string
  status: 'active' | 'paid' | 'expired'
  created_at: string // ISO 8601 format date
  allow_comments: boolean
  allow_anonymous: boolean
  expiration_date?: string // ISO 8601 format date
  paid_at?: string // ISO 8601 format date
  paid_anonymously: boolean
  comment?: string
  hidden_message?: string
  payload?: string
  paid_btn_name?: 'viewItem' | 'openChannel' | 'openBot' | 'callback'
  paid_btn_url?: string
}

type TPaidInvoice = {
  status: 'paid'
  fee_asset?: TAsset
  fee_amount?: number
  paid_usd_rate?: string
}

type TCryptoInvoice = TBaseInvoice & {
  currency_type: 'crypto'
  asset?: TAsset
}

type TPaidCryptoInvoice = TPaidInvoice & TCryptoInvoice

type TFiatInvoice = TBaseInvoice & {
  currency_type: 'fiat'
  /** Such as: 'USD', 'EUR', 'RUB' */
  fiat?: string
  accepted_assets?: TAsset[]
}

type TPaidFiatInvoice = TPaidInvoice &
TFiatInvoice & {
  paid_asset?: TAsset // Available if currency_type is "fiat" and status is "paid".
  paid_amount?: string // Available if currency_type is "fiat" and status is "paid"
  paid_fiat_rate?: string // Available if currency_type is "fiat" and status is "paid"
}

export type TInvoice = TCryptoInvoice | TFiatInvoice | TPaidFiatInvoice | TPaidCryptoInvoice
