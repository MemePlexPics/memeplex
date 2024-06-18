declare module 'telegraf-ratelimit' {
  import type { Context } from 'telegraf'

  interface LimitOptions<GContext extends Context = Context> {
    window?: number
    limit?: number
    keyGenerator?: (ctx: GContext) => string | undefined
    onLimitExceeded?: (ctx: GContext, next: () => Promise<void>) => Promise<void> | void
  }

  declare function limit<GContext extends Context = Context>(options?: LimitOptions<GContext>): (ctx: GContext, next: () => Promise<void>) => Promise<void> | void

  type TContext = Parameters<ReturnType<typeof limit>>
  export default limit
}
