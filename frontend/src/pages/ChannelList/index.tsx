import { useState } from "react"

import { Button, ChannelList, Input } from "../../components"
import { getTgChannelName, getUrl } from "../../utils"

import './style.css'
export const ChannelListPage = () => {
    const [channelSuggestion, setChannelSuggestion] = useState('')

    const onClickSubmit = async () => {
        const channel = getTgChannelName(channelSuggestion)
        if (!channel) return
        const response = await fetch(getUrl('/suggestChannel'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channel })
        })
        if (response.status === 500) {
            alert('An error occurred, please try again later')
            return
        }
        alert('Thank you for the suggestion!')
        setChannelSuggestion('')
    }

    return (
        <div id="channel-list-page">
            <div className="suggest-channel">
                <label>Suggest channel: </label>
                <div className="suggest-channel-input">
                    <Input
                        value={channelSuggestion}
                        onInput={setChannelSuggestion}
                        placeholder='@name or https://t.me/name'
                        onPressEnter={onClickSubmit}
                    />
                    <Button onClick={onClickSubmit}>Suggest</Button>
                </div>
            </div>
            <ChannelList />
        </div>
    )
}
