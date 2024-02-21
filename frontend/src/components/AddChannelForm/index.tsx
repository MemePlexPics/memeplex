import { useState } from "react"
import { Button, Input } from ".."
import { getTgChannelName } from "../../utils"

import './style.css'

export const AddChannelForm = (props: {
    onAddChannel: (channel: string, langs: string[]) => Promise<boolean>
}) => {
    const [channelValue, setChannelValue] = useState('')

    const onClickSubmit = async () => {
        const channel = getTgChannelName(channelValue)
        if (await props.onAddChannel(channel, ['eng']))
            setChannelValue('')
    }

    return (
        <div className="add-channel-form">
            <div id="form-container">
                <form id="channel-inputs" className="channel-inputs">
                <label className="label" htmlFor="channel">Channel:</label>
                <Input
                    id="channel"
                    className="input"
                    type="text"
                    required
                    placeholder="@name or https://t.me/name"
                    value={channelValue}
                    onInput={setChannelValue}
                />
                </form>
                <Button
                    type="submit"
                    value="Submit"
                    onClick={onClickSubmit}
                />
            </div>
        </div>
    )
}
