import { useState } from "react"

import { Button, ChannelList, Input } from "../../components"
import { getTgChannelName, getUrl } from "../../utils"

import './style.css'
import { useMeta, useNotification, useTitle } from "../../hooks"
import { ENotificationType } from "../../components/Notification/constants"

export const ChannelListPage = () => {
    const setNotification = useNotification()
    const [channelSuggestion, setChannelSuggestion] = useState('')
    const { title } = useTitle(['Channels'])

    useMeta([
        {
            name: 'og:description',
            content: 'List of telegram channels-sources',
        },
        {
            name: "og:title",
            content: title,
        },
        {
            name: "og:url",
            content: window.location.href,
        },
        {
            name: "og:image",
            content: "/android-chrome-192x192.png",
        },
    ])

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
            setNotification({
              text: 'An error occurred, please try again later',
              type: ENotificationType.ERROR,
            })
            return
        }
        setNotification({
          text: 'Thank you for the suggestion!\nIt will be added after review',
          type: ENotificationType.OK,
        })
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
