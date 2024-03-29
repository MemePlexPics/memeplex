import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChannelList } from '../../components'
import { ENotificationType } from '../../components/Notification/constants'
import { useMeta, useNotification, useTitle } from '../../hooks'
import { suggestChannel } from '../../services'
import { getTgChannelName } from '../../utils'

import { Button, Input } from '@/components/atoms'

import './style.css'

export const ChannelListPage = () => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  const [channelSuggestion, setChannelSuggestion] = useState('')
  const { title } = useTitle(['Channels'])

  useMeta([
    {
      name: 'description',
      content: t('meta.channelsDescription'),
    },
    {
      name: 'og:description',
      content: t('meta.channelsDescription'),
    },
    {
      name: 'og:title',
      content: title,
    },
    {
      name: 'og:url',
      content: window.location.href,
    },
    {
      name: 'og:image',
      content: '/android-chrome-192x192.png',
    },
  ])

  const onClickSubmit = async () => {
    const channel = getTgChannelName(channelSuggestion)
    if (!channel) return
    const response = await suggestChannel(channel)
    if (response.status === 500) {
      setNotification({
        text: t('label.errorOccured'),
        type: ENotificationType.ERROR,
      })
      return
    }
    setNotification({
      text: t('notification.thankForSuggestion'),
      type: ENotificationType.OK,
    })
    setChannelSuggestion('')
  }

  return (
    <div id='channel-list-page'>
      <div className='suggest-channel'>
        <label className='label'>{t('label.suggestChannel')}: </label>
        <div className='suggest-channel-input'>
          <Input
            value={channelSuggestion}
            onInput={setChannelSuggestion}
            placeholder={t('placeholder.channel')}
            onPressEnter={onClickSubmit}
          />
          <Button onClick={onClickSubmit}>{t('button.suggest')}</Button>
        </div>
      </div>
      <ChannelList />
    </div>
  )
}
