import { AddChannelForm, AddFeaturedChannelForm, ChannelList, ChannelSuggestionList, FeaturedChannelList, Input } from '../../components'
import './style.css'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { dialogConfirmationAtom } from '../../store/atoms/dialogConfirmationAtom'
import { addChannel, addFeaturedChannel, getFeaturedChannel, proceedChannelSuggestion, removeChannel, removeFeaturedChannel } from '../../services'
import { useAdminRequest, useMeta, useNotification, useTitle } from '../../hooks'
import { ENotificationType } from '../../components/Notification/constants'
import { IFeaturedChannel } from '../../types'

export const AdminPage = () => {
  const setNotification = useNotification()
  const [password, setPassword] = useState('')
  const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)
  const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)
  const [featuredUpdateSwitch, setFeaturedUpdateSwitch] = useState(true)
  const setDialog = useSetAtom(dialogConfirmationAtom)
  const { handleAdminRequest } = useAdminRequest()

  const handleAddChannel = async (channel: string, langs: string[]) => {
    const response = await addChannel(channel, langs, password)
    if (!handleAdminRequest(response))
      return false
    setNotification({
      text: `The @${channel} has been successfully added`,
      type: ENotificationType.OK
    })
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const handleRemoveFeaturedChannel = async (channel: IFeaturedChannel) => {
    const response = await removeFeaturedChannel(channel.username, password)
    if (!handleAdminRequest(response))
      return false
    setNotification({
      text: `The «${channel.title}» has been successfully unfeatured`,
      type: ENotificationType.OK
    })
    setFeaturedUpdateSwitch(!featuredUpdateSwitch)
    return true
  }

  const handleAddFeaturedChannel = async (channel: IFeaturedChannel) => {
    const response = await addFeaturedChannel(channel, password)
    if (!handleAdminRequest(response))
      return false
    setNotification({
      text: `The «${channel.title}» has been successfully featured`,
      type: ENotificationType.OK
    })
    setFeaturedUpdateSwitch(!featuredUpdateSwitch)
    return true
  }

  const handleSuggestionRemove = async (channel: string) => {
    const response = await proceedChannelSuggestion(channel, password)
    if (!handleAdminRequest(response))
      return false
    setNotification({
      text: `The @${channel} suggestion has been successfully declined`,
      type: ENotificationType.OK
    })
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    return true
  }

  const handleRemoveChannel = async (channel: string) => {
    const response = await removeChannel(channel, password)
    if (!handleAdminRequest(response))
      return false
    setNotification({
      text: `The @${channel} has been successfully removed`,
      type: ENotificationType.OK
    })
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const validChannelAndPasswordField = (channel: string) => {
    if (!channel || !password) {
      const incorrectFields = Object.entries({ channel, password }).reduce((acc, [field, value]) => {
        if (!value) acc.push(field)
        return acc
      }, [] as string[])
      setNotification({
        text: `Incorrect fields:\n${incorrectFields.join(', ')}`,
        type: ENotificationType.INFO,
      })
      return false
    }
    return true
  }

  const onAddChannel = async (channel: string, langs: string[]) => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (areFieldsValid)
      return handleAddChannel(channel, langs)
    return false
  }

  const onAddFeaturedChannel = async (channel: IFeaturedChannel) => {
    const areFieldsValid = validChannelAndPasswordField(channel.username)
    if (areFieldsValid)
      return handleAddFeaturedChannel(channel)
    return false
  }

  const onFeaturedAction = async (channel: IFeaturedChannel, action: 'view' | 'remove') => {
    const areFieldsValid = validChannelAndPasswordField(channel.username)
    if (!areFieldsValid)
      return false
    if (action === 'remove') {
      setDialog({
        text: `Remove the featured «${channel.title}» (@${channel.username})?`,
        isOpen: true,
        onClickAccept: () => handleRemoveFeaturedChannel(channel),
      })
      return true
    }
    if (action === 'view') {
      const request = await getFeaturedChannel(channel.username, password)
      if (!handleAdminRequest(request))
        return false
      const response = await request.json() as unknown as IFeaturedChannel
      const date = new Date(response.timestamp * 1000).toLocaleString()
      setDialog({
        text: `Title: «${response.title}»\nUsername: @${response.username}\nFrom: ${date}\nComment: ${response.comment || '—'}`,
        isOpen: true,
        rejectText: false,
      })
      return true
    }
  }

  const onSuggestionAction = async (channel: string, action: 'add' | 'remove') => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (!areFieldsValid)
      return false
    if (action === 'add') {
      setDialog({
        text: `Accept the suggested @${channel}?`,
        isOpen: true,
        onClickAccept: () => handleAddChannel(channel, []),
      })
      return true
    }
    setDialog({
      text: `Reject the suggested @${channel}?`,
      isOpen: true,
      onClickAccept: () => handleSuggestionRemove(channel),
    })
  }

  const onRemoveChannel = async (channel: string) => {
    const areFieldsValid = validChannelAndPasswordField(channel)
    if (areFieldsValid) {
      setDialog({
        text: `Remove the channel @${channel}?`,
        isOpen: true,
        onClickAccept: () => handleRemoveChannel(channel),
      })
    }
  }

  useTitle(['Admin'])

  useMeta([
      {
          name: 'robots',
          content: 'noindex',
      },
  ])

  return (
    <div className='admin-page'>
      <Input
          id="password"
          className="input"
          type="password"
          required
          placeholder="Password"
          value={password}
          onInput={setPassword}
      />
      <h2>Add channel</h2>
      <AddChannelForm onAddChannel={onAddChannel} />
      <h2>Add featured channel</h2>
      <AddFeaturedChannelForm onAddChannel={onAddFeaturedChannel} />
      <h2>Featured channels</h2>
      <FeaturedChannelList isAdmin updateSwitch={featuredUpdateSwitch} onAction={onFeaturedAction} />
      <h2>Suggestions</h2>
      <ChannelSuggestionList updateSwitch={suggestionsUpdateSwitch} onAction={onSuggestionAction} />
      <h2>Channels</h2>
      <ChannelList isAdmin updateSwitch={channelsUpdateSwitch} onRemoveChannel={onRemoveChannel} />
    </div>
  )
}
