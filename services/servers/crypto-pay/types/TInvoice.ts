type TPayUrl = `https://t.me/${'CryptoBot' | 'CryptoTestnetBot'}?start=${TInvoice['hash']}`

export type TInvoice = {
  invoice_id: number
  hash: string
  currency_type: 'crypto' | 'flat'
  asset: 'USDT' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX' | 'USDC'
  amount: string
  pay_url: TPayUrl
  bot_invoice_url: TPayUrl
  description: string
  status: 'active' | 'paid'
  created_at: string
  allow_comments: boolean
  allow_anonymous: boolean
  expiration_date: string
}
