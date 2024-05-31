import { eq, inArray } from 'drizzle-orm'
import { topics } from '../constants/topics'
import {
  botKeywords,
  botTopicKeywordUnsubscriptions,
  botTopicNames,
  botTopicSubscriptions,
  botTopics,
} from '../db/schema'
import { getDbConnection } from '../utils'
import { selectBotKeywordsByKeywords, selectBotTopicNames } from '../utils/mysql-queries'

export const setBotTopics = async () => {
  const topicNames = Object.keys(topics)
  const db = await getDbConnection()
  await db
    .insert(botTopicNames)
    .ignore()
    .values(topicNames.map(name => ({ name })))
  const topicsInDb = await selectBotTopicNames(db)
  for (const topic of topicsInDb) {
    if (!topics[topic.name]) {
      // Drop subscriptions
      await db.delete(botTopicSubscriptions).where(eq(botTopicSubscriptions.topicId, topic.id))
      const keywordsFromTopic = await db
        .select()
        .from(botTopics)
        .where(eq(botTopics.nameId, topic.id))
      const keywordIdsFromTopic = keywordsFromTopic.map(keyword => keyword.keywordId)
      // Drop keywords without reference
      try {
        await db.delete(botKeywords).where(inArray(botKeywords.id, keywordIdsFromTopic))
      } catch (error) {
        console.error('There were some other references to some keywords we tried to delete')
      }
      // Drop unsubscribtion keywords
      await db
        .delete(botTopicKeywordUnsubscriptions)
        .where(inArray(botTopicKeywordUnsubscriptions.keywordId, keywordIdsFromTopic))
      await db.delete(botTopics).where(eq(botTopics.nameId, topic.id))
      // Drop topic
      await db.delete(botTopicNames).where(eq(botTopicNames.name, topic.name))
      continue
    }
    const oldTopicKeywordsInDb = await db
      .select({
        keyword: botKeywords.keyword,
        keywordId: botKeywords.id,
      })
      .from(botTopics)
      .where(eq(botTopics.nameId, topic.id))
      .leftJoin(botKeywords, eq(botKeywords.id, botTopics.keywordId))
    const keywordsToDelete = oldTopicKeywordsInDb.filter(
      oldKeyword => !topics[topic.name].includes(oldKeyword.keyword),
    )
    const keywordIdsToDelete = keywordsToDelete.map(keyword => keyword.keywordId)
    if (keywordIdsToDelete.length !== 0) {
      await db.delete(botTopics).where(inArray(botTopics.keywordId, keywordIdsToDelete))
      try {
        await db.delete(botKeywords).where(inArray(botKeywords.id, keywordIdsToDelete))
      } catch (error) {
        console.error('There were some other references to some keywords we tried to delete')
      }
    }
    // Insert new topic keywords
    await db
      .insert(botKeywords)
      .ignore()
      .values(topics[topic.name].map(keyword => ({ keyword })))
    const keywordsInDb = await selectBotKeywordsByKeywords(db, topics[topic.name])
    // Insert topic-keyword connections
    await db
      .insert(botTopics)
      .ignore()
      .values(
        keywordsInDb.map(keyword => ({
          keywordId: keyword.id,
          nameId: topic.id,
        })),
      )
  }
  console.log(`It's done!`)
}

setBotTopics()
