import { useState } from "react"
import { AddFeaturedChannelForm, FeaturedChannelList } from "../.."
import { useAdminRequest, useNotification } from "../../../hooks"
import { useSetAtom } from "jotai"
import { dialogConfirmationAtom } from "../../../store/atoms/dialogConfirmationAtom"
import { addFeaturedChannel, getFeaturedChannel, removeFeaturedChannel } from "../../../services"
import { IFeaturedChannel } from "../../../types"
import { ENotificationType } from "../../Notification/constants"
import { getFieldsWithUntrueValues } from "../../../utils"
import { useTranslation } from "react-i18next"

export const FeaturedChannels = (props: {
    password: string
    className?: string
}) => {
    const { t } = useTranslation()
    const setNotification = useNotification()
    const [featuredUpdateSwitch, setFeaturedUpdateSwitch] = useState(true)
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const { handleAdminRequest } = useAdminRequest()
  
    const handleRemoveFeaturedChannel = async (channel: IFeaturedChannel) => {
      const response = await removeFeaturedChannel(channel.username, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: t('notification.channelUnfeatured', { channel: channel.title }),
        type: ENotificationType.OK
      })
      setFeaturedUpdateSwitch(!featuredUpdateSwitch)
      return true
    }
  
    const handleAddFeaturedChannel = async (channel: IFeaturedChannel) => {
      const response = await addFeaturedChannel(channel, props.password)
      if (!handleAdminRequest(response))
        return false
      setNotification({
        text: t('notification.channelFeatured', { channel: channel.title }),
        type: ENotificationType.OK
      })
      setFeaturedUpdateSwitch(!featuredUpdateSwitch)
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
  
    const onAddFeaturedChannel = async (channel: IFeaturedChannel) => {
      const areFieldsValid = validChannelAndPasswordField(channel.username)
      if (areFieldsValid)
        return handleAddFeaturedChannel(channel)
      return false
    }
  
    const onFeaturedAction = async (channel: IFeaturedChannel, action: 'view' | 'remove') => {
      const areFieldsValid = validChannelAndPasswordField(channel.username)
      if (!areFieldsValid)
        return false
      if (action === 'remove') {
        setDialog({
          text: `${t('notification.removeFeatured')} «${channel.title}» (@${channel.username})?`,
          isOpen: true,
          onClickAccept: () => handleRemoveFeaturedChannel(channel),
        })
        return true
      }
      if (action === 'view') {
        const request = await getFeaturedChannel(channel.username, props.password)
        if (!handleAdminRequest(request))
          return false
        const response = await request.json() as unknown as IFeaturedChannel
        const date = new Date(response.timestamp * 1000).toLocaleString()
        setDialog({
          text: `${t('label.title')}: «${response.title}»
            ${t('label.username')}: @${response.username}
            ${t('label.from')}: ${date}
            ${t('label.comment')}: ${response.comment || '—'}`,
          isOpen: true,
          rejectText: false,
        })
        return true
      }
    }

    return <div className={props.className}>
        <h2>{t('label.addFeaturedChannel')}</h2>
        <AddFeaturedChannelForm onAddChannel={onAddFeaturedChannel} />
        <h2>{t('label.featuredChannels')}</h2>
        <FeaturedChannelList isAdmin updateSwitch={featuredUpdateSwitch} onAction={onFeaturedAction} />
    </div>
}
