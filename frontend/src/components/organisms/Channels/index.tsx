import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AddChannelForm, ChannelList } from '../..'
import { useAdminRequest, useNotification } from '../../../hooks'
import { addChannel, removeChannel } from '../../../services'
import { setChannelMemesState } from '../../../services/admin'
import { memesFilterAtom } from '../../../store/atoms'
import { dialogConfirmationAtom } from '../../../store/atoms/dialogConfirmationAtom'
import { EMemeState } from '../../../types/enums'
import { getFieldsWithUntrueValues } from '../../../utils'
import { ENotificationType } from '../../Notification/constants'

import { Input } from '@/components/atoms'

export const Channels = (props: { password: string; className?: string }) => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  const setDialog = useSetAtom(dialogConfirmationAtom)
  const { handleAdminRequest } = useAdminRequest()
  const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)
  const [nameFilter, setNameFilter] = useState('')
  const setMemeFilters = useSetAtom(memesFilterAtom)
  const navigate = useNavigate()

  const handleAddChannel = async (channel: string, langs: string[]) => {
    const response = await addChannel(channel, langs, props.password)
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.channelAdded', { channel }),
      type: ENotificationType.OK,
    })
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const handleRemoveChannel = async (channel: string) => {
    const response = await removeChannel(channel, props.password)
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.channelRemoved', { channel }),
      type: ENotificationType.OK,
    })
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const handleRemoveChannelMemes = async (channel: string) => {
    const response = await setChannelMemesState(channel, EMemeState.HIDDEN, props.password)
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.channelMemesRemoved', { channel }),
      type: ENotificationType.OK,
    })
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

  const onAddChannel = async (channel: string, langs: string[]) => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (areFieldsValid) return handleAddChannel(channel, langs)
    return false
  }

  const onRemoveChannel = (channel: string) => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (areFieldsValid) {
      setDialog({
        text: `${t('notification.removeChannel')} @${channel}?`,
        isOpen: true,
        onClickAccept: () => handleRemoveChannel(channel),
      })
    }
  }

  const onClickDeleteChannelMemes = (channel: string) => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (areFieldsValid) {
      setDialog({
        text: t('notification.removeChannelMemes', { channel }),
        isOpen: true,
        onClickAccept: () => handleRemoveChannelMemes(channel),
      })
    }
  }

  const onClickImages = (channel: string) => {
    setMemeFilters({ channel: [channel] })
    navigate('/')
  }

  const onFilterChannels = (channel: string) => {
    setNameFilter(channel)
  }

  return (
    <div className={props.className}>
      <h2>{t('label.addChannel')}</h2>
      <AddChannelForm onAddChannel={onAddChannel} />
      <h2>{t('label.filter')}</h2>
      <Input
        placeholder={t('placeholder.channelFilter')}
        onPressEnter={onFilterChannels}
      />
      <h2>{t('label.channels')}</h2>
      <ChannelList
        isAdmin
        updateSwitch={channelsUpdateSwitch}
        filter={nameFilter}
        onClickImages={onClickImages}
        onClickEraser={onClickDeleteChannelMemes}
        onRemoveChannel={onRemoveChannel}
      />
    </div>
  )
}
