import { AddChannelForm, ChannelList, ChannelSuggestionList, Input } from '../../components'
import './style.css'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { dialogConfirmationAtom } from '../../store/atoms/dialogConfirmationAtom'
import { addChannel, proceedChannelSuggestion, removeChannel } from './utils'

export const AdminPage = () => {
  const [password, setPassword] = useState('')
  const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)
  const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)
  const setDialog = useSetAtom(dialogConfirmationAtom)

  const handleAdminRequest = (response: Response) => {
    if (response.status === 403) {
      setPassword('');
      return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
        return false
    }
    return true
  }

  const handleAddChannel = async (channel: string, langs: string[]) => {
    const response = await addChannel(channel, langs, password)
    if (!handleAdminRequest(response))
      return false
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const handleSuggestionRemove = async (channel: string) => {
    const response = await proceedChannelSuggestion(channel, password)
    if (!handleAdminRequest(response))
      return false
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    return true
  }

  const handleRemoveChannel = async (channel: string) => {
    const response = await removeChannel(channel, password)
    if (!handleAdminRequest(response))
      return false
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const onAddChannel = async (channel: string, langs: string[]) => {
    if (!channel || !password)
      return false
    return handleAddChannel(channel, langs)
  }

  const onSuggestionAction = async (channel: string, action: 'add' | 'remove') => {
    if (!channel || !password)
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
    if (!channel || !password)
        return false
    
    setDialog({
      text: `Remove the channel @${channel}?`,
      isOpen: true,
      onClickAccept: () => handleRemoveChannel(channel),
    })
  }

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
