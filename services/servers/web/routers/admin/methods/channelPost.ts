import { getDbConnection } from '../../../../../../utils'
import { OCR_LANGUAGES, TG_API_PARSE_FROM_DATE } from '../../../../../../constants'
import {
  insertChannel,
  selectChannel,
  updateChannelAvailability,
  proceedChannelSuggestion,
} from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import { TRequestHandler } from '../types'

export const channelPost: TRequestHandler<{
  channel: {
    name: string
    langs: string[]
    withText: number
  }
}> = async (req, res) => {
  const { name, langs, withText } = req.body.channel
  if (!name) return res.status(500).send()
  if (langs?.find(language => !OCR_LANGUAGES.includes(language))) {
    return res.status(500).send({
      error: `Languages should be comma separated. Allowed languages: ${OCR_LANGUAGES.join(',')}`,
    })
  }
  const languages = langs || ['eng']
  const db = await getDbConnection()
  const existedChannel = await selectChannel(db, name)
  if (existedChannel) {
    setLogAction(res, `⬆️ Updated the avialability of @${name}`)
    await updateChannelAvailability(db, {
      name,
      availability: 1,
      withText,
    })
  } else {
    setLogAction(res, `➕ Added @${name}`)
    await insertChannel(db, {
      name,
      availability: 1,
      withText,
      langs: languages.join(','),
      timestamp: TG_API_PARSE_FROM_DATE,
    })
    await proceedChannelSuggestion(db, name)
  }
  await db.close()
  return res.send()
}
