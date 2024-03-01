import { useSetAtom } from "jotai"
import { AddChannelForm, ChannelList } from "../.."
import { useAdminRequest, useNotification } from "../../../hooks"
import { addChannel, removeChannel } from "../../../services"
import { ENotificationType } from "../../Notification/constants"
import { dialogConfirmationAtom } from "../../../store/atoms/dialogConfirmationAtom"
import { useState } from "react"
import { getFieldsWithUntrueValues } from "../../../utils"

export const Channels = (props: {
    password: string
    className?: string
}) => {
    const setNotification = useNotification()
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const { handleAdminRequest } = useAdminRequest()
    const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)

    const handleAddChannel = async (channel: string, langs: string[]) => {
      const response = await addChannel(channel, langs, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: `The @${channel} has been successfully added`,
        type: ENotificationType.OK
      })
      setChannelsUpdateSwitch(!channelsUpdateSwitch)
      return true
    }

    const handleRemoveChannel = async (channel: string) => {
      const response = await removeChannel(channel, props.password)
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

    const onAddChannel = async (channel: string, langs: string[]) => {
      const areFieldsValid = validChannelAndPasswordField(channel)
      if (areFieldsValid)
        return handleAddChannel(channel, langs)
      return false
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

    return <div className={props.className}>
        <h2>Add channel</h2>
        <AddChannelForm onAddChannel={onAddChannel} />
        <h2>Channels</h2>
        <ChannelList isAdmin updateSwitch={channelsUpdateSwitch} onRemoveChannel={onRemoveChannel} />
    </div>
}
