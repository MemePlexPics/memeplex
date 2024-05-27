import type { Context } from 'telegraf'
import { Telegraf } from 'telegraf'

export class TelegrafWrapper<GContext extends Context = Context> extends Telegraf<GContext> {
  public abortController: Readonly<AbortController>
  constructor(token: string, options?: Partial<Telegraf.Options<GContext>>) {
    super(token, options)
    this.abortController = new AbortController()
  }

  public stop(reason?: string) {
    this.abortController.abort()
    return super.stop(reason)
  }
}
