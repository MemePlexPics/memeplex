import { useState } from "react"
import { Button, Input } from ".."
import { getTgChannelName } from "../../utils"
import stylex from '@stylexjs/stylex'
import { s } from './style'
import { useTranslation } from "react-i18next"

export const AddChannelForm = (props: {
    onAddChannel: (channel: string, langs: string[]) => Promise<boolean>
}) => {
    const { t } = useTranslation()
    const [channelValue, setChannelValue] = useState('')

    const onClickSubmit = async () => {
        const channel = getTgChannelName(channelValue)
        if (await props.onAddChannel(channel, ['eng']))
            setChannelValue('')
    }

    return (
        <div {...stylex.props(s.addChannelForm)}>
            <div id="form-container">
                <div {...stylex.props(s.inputContainer)}>
                <Input
                    type="text"
                    required
                    placeholder={t('placeholder.channel')}
                    value={channelValue}
                    onInput={setChannelValue}
                    onPressEnter={onClickSubmit}
                />
                <Button
                    type="submit"
                    value={t('button.submit')}
                    onClick={onClickSubmit}
                />
                </div>
            </div>
        </div>
    )
}
