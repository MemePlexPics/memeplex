import { useSetAtom } from "jotai"
import { ChannelSuggestionList } from "../.."
import { useAdminRequest, useNotification } from "../../../hooks"
import { dialogConfirmationAtom } from "../../../store/atoms/dialogConfirmationAtom"
import { getFieldsWithUntrueValues } from "../../../utils"
import { ENotificationType } from "../../Notification/constants"
import { addChannel, proceedChannelSuggestion } from "../../../services"
import { useState } from "react"

export const SuggestedChannels = (props: {
    password: string
    className?: string
}) => {
    const setNotification = useNotification()
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const [suggestionsUpdateSwitch, setSuggestionsUpdateSwitch] = useState(true)
    const { handleAdminRequest } = useAdminRequest()

    const handleAddChannel = async (channel: string, langs: string[]) => {
      const response = await addChannel(channel, langs, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: `The @${channel} has been successfully added`,
        type: ENotificationType.OK
      })
      setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
      return true
    }

    const handleSuggestionRemove = async (channel: string) => {
      const response = await proceedChannelSuggestion(channel, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: `The @${channel} suggestion has been successfully declined`,
        type: ENotificationType.OK
      })
      setSuggestionsUpdateSwitch(!suggestionsUpdateSwitch)
      return true
    }

    const validChannelAndPasswordField = (channel: string) => {
      if (!channel || !props.password) {
        const incorrectFields = getFieldsWithUntrueValues({ channel, password: props.password })
        setNotification({
          text: `Incorrect fields:\n${incorrectFields.join(', ')}`,
          type: ENotificationType.INFO,
        })
        return false
      }
      return true
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

    return <div className={props.className}>
        <h2>Suggestions</h2>
        <ChannelSuggestionList updateSwitch={suggestionsUpdateSwitch} onAction={onSuggestionAction} />
    </div>
}
