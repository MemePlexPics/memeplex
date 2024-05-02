import { TInvoice } from '.'

export type TInvoiceCreated = Pick<
TInvoice,
| 'invoice_id'
| 'hash'
| 'currency_type'
| 'amount'
| 'bot_invoice_url'
| 'description'
| 'status'
| 'created_at'
| 'allow_comments'
| 'allow_anonymous'
| 'expiration_date'
>
