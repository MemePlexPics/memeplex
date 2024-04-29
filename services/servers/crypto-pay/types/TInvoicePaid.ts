export type TInvoicePaid = {
  invoice_id: number
  hash: string
  amount: string
  fee_asset?: 'USDT' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX' | 'USDC' | 'JET' // Available if status is "paid"
  fee_amount?: number // Available if status is "paid"
  bot_invoice_url: string
  description?: string
  status: 'active' | 'paid' | 'expired'
  created_at: string // ISO 8601 format date
  paid_usd_rate?: string // Available if status is "paid"
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
} & (
  | {
    currency_type: 'crypto'
    asset?: 'USDT' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX' | 'USDC' | 'JET'
  }
  | {
    currency_type: 'fiat'
    fiat?:
    | 'USD'
    | 'EUR'
    | 'RUB'
    | 'BYN'
    | 'UAH'
    | 'GBP'
    | 'CNY'
    | 'KZT'
    | 'UZS'
    | 'GEL'
    | 'TRY'
    | 'AMD'
    | 'THB'
    | 'INR'
    | 'BRL'
    | 'IDR'
    | 'AZN'
    | 'AED'
    | 'PLN'
    | 'ILS'
    paid_asset?: 'USDT' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX' | 'USDC' | 'JET' // Available if currency_type is "fiat" and status is "paid"
    paid_amount?: string // Available if currency_type is "fiat" and status is "paid"
    paid_fiat_rate?: string // Available if currency_type is "fiat" and status is "paid"
    accepted_assets?: Array<
    'USDT' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX' | 'USDC' | 'JET'
    > // Available if currency_type is "fiat"
  }
)
