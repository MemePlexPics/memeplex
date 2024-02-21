import { AddChannelForm, ChannelList, ChannelSuggestionList, Input } from '../../components'
import './style.css'
import { getUrl } from '../../utils'
import { useState } from 'react'

export const AdminPage = () => {
  const [password, setPassword] = useState('')
  const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)
  const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)

  const onAddChannel = async (channel: string, langs: string[]) => {
    if (!channel)
        return false
    const response = await fetch(getUrl('/addChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          langs,
          password,
        })
      })
      if (response.status === 403) {
        setPassword('');
        return false
      }
      localStorage.setItem('isAdmin', '1')
      if (response.status === 500) {
          return false
      }
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
  }

  const onSuggestionAction = async (channel: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      onAddChannel(channel, [])
      return true
    }
    if (!channel || !password)
        return false
    const response = await fetch(getUrl('/proceedChannelSuggestion'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            channel,
            password,
        })
    })
    if (response.status === 403) {
        setPassword('');
        return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
        return false
    }
    setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
    return true
  }

  const onRemoveChannel = async (channel: string) => {
    if (!channel || !password)
        return false
    const response = await fetch(getUrl('/removeChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            channel,
            password,
        })
    })
    if (response.status === 403) {
        setPassword('');
        return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
        return false
    }
    setChannelsUpdateSwitch(!channelsUpdateSwitch)
    return true
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
