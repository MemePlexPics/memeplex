import { useState } from "react"
import { Button, Input } from ".."
import { getTgChannelName } from "../../utils"

import './style.css'
import { IFeaturedChannel } from "../../types"

export const AddFeaturedChannelForm = (props: {
    onAddChannel: (channel: IFeaturedChannel) => Promise<boolean>
}) => {
    // TODO: <Form model={} />
    const [channelValue, setChannelValue] = useState('')
    const [titleValue, setTitleValue] = useState('')
    const [commentValue, setCommentValue] = useState('')

    const onClickSubmit = async () => {
        const channel = getTgChannelName(channelValue)
        if (await props.onAddChannel({
            username: channel,
            title: titleValue,
            comment: commentValue,
            timestamp: Date.now() / 1000,
        })) {
            setChannelValue('')
            setTitleValue('')
            setCommentValue('')
        }
    }

    return (
        <div className="add-featured-channel-form">
            <div id="form-container">
                <label className="label" htmlFor="channel">Channel:</label>
                <div className="input-container">
                    <Input
                        id="channel"
                        className="input"
                        type="text"
                        required
                        placeholder="@name or https://t.me/name"
                        value={channelValue}
                        onInput={setChannelValue}
                        onPressEnter={onClickSubmit}
                    />
                </div>
                <label className="label" htmlFor="title">Title:</label>
                <div className="input-container">
                    <Input
                        id="title"
                        className="input"
                        type="text"
                        required
                        placeholder="Readable title"
                        value={titleValue}
                        onInput={setTitleValue}
                        onPressEnter={onClickSubmit}
                    />
                </div>
                <label className="label" htmlFor="comment">Comment:</label>
                <div className="input-container">
                    <Input
                        id="channel"
                        className="input"
                        type="text"
                        placeholder="Comment"
                        value={commentValue}
                        onInput={setCommentValue}
                        onPressEnter={onClickSubmit}
                    />
                </div>
                <Button
                    type="submit"
                    value="Submit"
                    onClick={onClickSubmit}
                />
            </div>
        </div>
    )
}
