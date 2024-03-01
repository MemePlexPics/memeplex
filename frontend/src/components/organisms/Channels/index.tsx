import { useSetAtom } from "jotai"
import { AddChannelForm, ChannelList } from "../.."
import { useAdminRequest, useNotification } from "../../../hooks"
import { addChannel, removeChannel } from "../../../services"
import { ENotificationType } from "../../Notification/constants"
import { dialogConfirmationAtom } from "../../../store/atoms/dialogConfirmationAtom"
import { useState } from "react"
import { getFieldsWithUntrueValues } from "../../../utils"
import { useTranslation } from "react-i18next"

export const Channels = (props: {
    password: string
    className?: string
}) => {
    const { t } = useTranslation()
    const setNotification = useNotification()
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const { handleAdminRequest } = useAdminRequest()
    const [channelsUpdateSwitch, setChannelsUpdateSwitch] = useState(true)

    const handleAddChannel = async (channel: string, langs: string[]) => {
      const response = await addChannel(channel, langs, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: t('notification.channelAdded', { channel }),
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
        text: t('notification.channelRemoved', { channel }),
        type: ENotificationType.OK
      })
      setChannelsUpdateSwitch(!channelsUpdateSwitch)
      return true
    }

    const validChannelAndPasswordField = (channel: string) => {
      if (!channel || !props.password) {
        const incorrectFields = getFieldsWithUntrueValues({ channel, password: props.password })
        setNotification({
          text: `${t('notification.incorrectFields')}:\n${incorrectFields.join(', ')}`,
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
          text: `${t('notification.removeChannel')} @${channel}?`,
          isOpen: true,
          onClickAccept: () => handleRemoveChannel(channel),
        })
      }
    }

    return <div className={props.className}>
        <h2>{t('label.addChannel')}</h2>
        <AddChannelForm onAddChannel={onAddChannel} />
        <h2>{t('label.channels')}</h2>
        <ChannelList isAdmin updateSwitch={channelsUpdateSwitch} onRemoveChannel={onRemoveChannel} />
    </div>
}
