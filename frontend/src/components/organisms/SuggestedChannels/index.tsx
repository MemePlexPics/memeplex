import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChannelSuggestionList } from '../..'
import { useAdminRequest, useNotification } from '../../../hooks'
import { addChannel, proceedChannelSuggestion } from '../../../services'
import { dialogConfirmationAtom } from '../../../store/atoms/dialogConfirmationAtom'
import { getFieldsWithUntrueValues } from '../../../utils'
import { ENotificationType } from '../../Notification/constants'

import { Input } from '@/components/atoms'

export const SuggestedChannels = (props: { password: string; className?: string }) => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  const setDialog = useSetAtom(dialogConfirmationAtom)
  const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)
  const [nameFilter, setNameFilter] = useState('')
  const { handleAdminRequest } = useAdminRequest()

  const handleAddChannel = async (channel: string, langs: string[]) => {
    const response = await addChannel(
      {
        name: channel,
        langs,
        withText: false,
      },
      props.password,
    )
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.channelAdded', { channel }),
      type: ENotificationType.OK,
    })
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    return true
  }

  const handleSuggestionRemove = async (channel: string) => {
    const response = await proceedChannelSuggestion(channel, props.password)
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.suggestDeclined', { channel }),
      type: ENotificationType.OK,
    })
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    return true
  }

  const validChannelAndPasswordField = (channel: string) => {
    if (!channel || !props.password) {
      const incorrectFields = getFieldsWithUntrueValues({ channel, password: props.password })
      setNotification({
        text: `${t('notification.incorrectFields')}:\n${incorrectFields.join(', ')}`,
        type: ENotificationType.INFO,
      })
      return false
    }
    return true
  }

  const onSuggestionAction = (channel: string, action: 'add' | 'remove') => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (!areFieldsValid) return false
    if (action === 'add') {
      setDialog({
        text: `${t('notification.acceptSuggest')} @${channel}?`,
        isOpen: true,
        onClickAccept: () => handleAddChannel(channel, []),
      })
      return true
    }
    setDialog({
      text: `${t('notification.rejectSuggest')} @${channel}?`,
      isOpen: true,
      onClickAccept: () => handleSuggestionRemove(channel),
    })
  }

  const onFilterChannels = (channel: string) => {
    setNameFilter(channel)
  }

  return (
    <div className={props.className}>
      <h2>{t('label.filter')}</h2>
      <Input
        placeholder={t('placeholder.channelFilter')}
        onPressEnter={onFilterChannels}
      />
      <ChannelSuggestionList
        updateSwitch={suggestionsUpdateSwitch}
        filter={nameFilter}
        onAction={onSuggestionAction}
      />
    </div>
  )
}
