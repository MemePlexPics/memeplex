import { useEffect, useState } from "react"
import { Button, Checkbox, Input } from ".."
import { getTgChannelName } from "../../utils"

import './style.css'

export const AddChannelForm = (props: {
    channel: string
    onAddChannel: (channel: string, langs: string[]) => Promise<boolean>
}) => {
    const [newChannelModel, setNewChannelModel] = useState({
      name: '',
      rus: false,
      eng: false,
    })
  
    const onClickSubmit = async () => {
        const channel = getTgChannelName(newChannelModel.name)
        // @ts-ignore // TODO: type
        const langs = ['rus', 'eng'].filter(lang => newChannelModel[lang])
        if (await props.onAddChannel(channel, langs))
            setNewChannelModel({ ...newChannelModel, name: '', rus: false, eng: false })
    }

    useEffect(() => {
        setNewChannelModel(() => ({
            ...newChannelModel,
            name: props.channel,
        }))
    }, [props.channel])

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
                    value={newChannelModel.name}
                    onInput={(value) => setNewChannelModel(
                    {
                        ...newChannelModel,
                        name: value,
                    }
                    )}
                />
                <label className="label" htmlFor="languages">Languages:</label>
                <div id="languages">
                    <Checkbox
                        id="lang-eng"
                        checked={newChannelModel.eng}
                        onChange={(state) =>
                            setNewChannelModel(
                            {
                                ...newChannelModel,
                                eng: state,
                            }
                            )
                        }
                    />
                    <label className="label" htmlFor="lang-eng">English</label>
                    <Checkbox
                        id="lang-rus"
                        checked={newChannelModel.rus}
                        onChange={(state) =>
                            setNewChannelModel(
                            {
                                ...newChannelModel,
                                rus: state,
                            }
                            )
                        }
                    />
                    <label className="label" htmlFor="lang-rus">Russian</label>
                </div>
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
