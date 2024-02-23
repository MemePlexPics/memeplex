import { AddChannelForm, ChannelList, ChannelSuggestionList, Input } from '../../components'
import './style.css'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { dialogConfirmationAtom } from '../../store/atoms/dialogConfirmationAtom'
import { addChannel, proceedChannelSuggestion, removeChannel } from './utils'
import { useNotification, useTitle } from '../../hooks'
import { ENotificationType } from '../../components/Notification/constants'

export const AdminPage = () => {
  const setNotification = useNotification()
  const [password, setPassword] = useState('')
  const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)
  const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)
  const setDialog = useSetAtom(dialogConfirmationAtom)

  const handleAdminRequest = (response: Response) => {
    if (response.status === 403) {
      setPassword('');
      setNotification({
        text: 'Incorrect password!',
        type: ENotificationType.INFO,
      })
      return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
      setNotification({
        text: 'An error occurred, please try again later',
        type: ENotificationType.ERROR,
      })
      return false
    }
    return true
  }

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
      <h2>Suggestions</h2>
      <ChannelSuggestionList updateSwitch={suggestionsUpdateSwitch} onSuggestionAction={onSuggestionAction} />
      <h2>Channels</h2>
      <ChannelList isAdmin updateSwitch={channelsUpdateSwitch} onRemoveChannel={onRemoveChannel} />
    </div>
  )
}
