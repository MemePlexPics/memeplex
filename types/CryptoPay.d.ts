declare module '@foile/crypto-pay-api' {
  import { EventEmitter } from 'events'

    type Asset = 'BTC' | 'TON' | 'ETH' | 'USDT' | 'USDC' | 'BUSD'
    type PaidButtonName = 'viewItem' | 'openChannel' | 'openBot' | 'callback'
    type UpdateType = 'invoice_paid'

    interface WebhookOptions {
      serverHostname: string
      serverPort?: number
      path: string
      tls?: object
    }

    interface CreateInvoiceOptions {
      description?: string
      hidden_message?: string
      paid_btn_name?: PaidButtonName
      paid_btn_url?: string
      payload?: string
      allow_comments?: boolean
      allow_anonymous?: boolean
      expires_in?: number
      currency_type: string
      fiat: string
      amount: string
    }

    interface TransferOptions {
      comment?: string
      disable_send_notification?: boolean
    }

    interface GetInvoicesOptions {
      asset?: string
      invoice_ids?: number[]
      status?: 'active' | 'paid'
      offset?: number
      count?: number
    }

    export class CryptoPay extends EventEmitter {
      constructor(token: string, options?: {
        protocol?: string
        hostname?: string
        updateVerification?: boolean
        webhook?: WebhookOptions
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getMe(): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createInvoice(asset?: Asset, amount?: string, options?: CreateInvoiceOptions): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transfer(user_id: number, asset: Asset, amount: string, spend_id: string, options?: TransferOptions): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getInvoices(options?: GetInvoicesOptions): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getBalance(): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getExchangeRates(): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getCurrencies(): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoicePaid(handler: (data: any) => void): this
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callApi(method: string, params?: any): Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      private handleUpdate(update: any): void
    }

    export const Assets: {
      BTC: 'BTC'
      TON: 'TON'
      ETH: 'ETH'
      USDT: 'USDT'
      USDC: 'USDC'
      BUSD: 'BUSD'
    }

    export const PaidButtonNames: {
      VIEW_ITEM: 'viewItem'
      OPEN_CHANNEL: 'openChannel'
      OPEN_BOT: 'openBot'
      CALLBACK: 'callback'
    }

    export default CryptoPay
}
