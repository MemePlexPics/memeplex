import type { Message, Update } from 'telegraf/typings/core/types/typegram'
import { onBotRecieveText } from '.'
import { getTranslation } from '../i18n'
import type { TTelegrafContext } from '../types'
import { MAX_SEARCH_QUERY_LENGTH } from '../../../../../constants'
import { QUERY_REDUNDANT_WORDS } from '../../../../../constants/publisher'

export const handleMemeSearchRequest = async (
  ctx: TTelegrafContext<Update.MessageUpdate<Message.TextMessage>>,
) => {
  ctx.session.search = {
    nextPage: null,
    query: null,
  }
  await onBotRecieveText(
    ctx,
    ctx.update.message.text.replace(/[@]?MemePlexBot/i, '').slice(0, MAX_SEARCH_QUERY_LENGTH),
  )
  const isTooLong = /(\s+[^ ]+){3,}/.test(ctx.update.message.text) // 4+ words
  const isContainRedundantWords = QUERY_REDUNDANT_WORDS.some(word =>
    new RegExp('(^|\\s)' + word + '(\\s|$)', 'iu').test(ctx.update.message.text),
  )
  if (isTooLong || isContainRedundantWords) {
    const aviceText = [
      isContainRedundantWords
        ? getTranslation(ctx.from.language_code).message.doNotAddToQuery()
        : undefined,
      isTooLong
        ? getTranslation(ctx.from.language_code).message.shortQueriesWorkBetter()
        : undefined,
    ]
      .filter(el => el)
      .join('\n')
    await ctx.reply(`
  ${getTranslation(ctx.from.language_code).message.questinableQueryAdvice()}
  ${aviceText}`)
  }
}
