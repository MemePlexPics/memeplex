import { Context } from 'telegraf'

export const resetSearchSession = (ctx: Context) => {
  // @ts-expect-error TODO: type for ctx.session
  ctx.session.search = {
    nextPage: null,
    query: null,
  }
}
