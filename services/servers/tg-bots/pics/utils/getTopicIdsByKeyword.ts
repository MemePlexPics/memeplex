import type { selectBotTopicWithKeywords } from '../../../../../utils/mysql-queries'

export const getTopicIdsByKeyword = (
  topics: Awaited<ReturnType<typeof selectBotTopicWithKeywords>>,
) =>
  topics.reduce<Record<string, number[]>>((obj, { nameId, keyword }) => {
    if (!keyword) return obj
    obj[keyword] ??= []
    obj[keyword].push(nameId)
    return obj
  }, {})
