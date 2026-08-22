import stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { s } from './style'

import { ENotificationType } from '@/components/Notification/constants'
import { Button, Input } from '@/components/atoms'
import { useAdminRequest, useNotification } from '@/hooks'
import { deletePremium, putPremium } from '@/services/admin'

export const PremiumSettings = (props: { password: string; className?: string }) => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  const { handleAdminRequest } = useAdminRequest()
  const [username, setUsername] = useState('')
  const [untilDate, setUntilDate] = useState('')

  const notifyMissingPassword = () => {
    setNotification({
      text: t('notification.enterPassword'),
      type: ENotificationType.ERROR,
    })
  }

  const handleNotFound = (name: string) => {
    setNotification({
      text: t('notification.userNotFound', { username: name.replace(/^@/, '') }),
      type: ENotificationType.ERROR,
    })
  }

  const onClickSet = async () => {
    if (!props.password) {
      notifyMissingPassword()
      return
    }
    if (!username.trim() || !untilDate) {
      setNotification({
        text: t('notification.incorrectFields'),
        type: ENotificationType.INFO,
      })
      return
    }
    const response = await putPremium(username, untilDate, props.password)
    if (response.status === 404) {
      handleNotFound(username)
      return
    }
    if (!handleAdminRequest(response)) return
    setNotification({
      text: t('notification.premiumSet', {
        username: username.replace(/^@/, ''),
        date: untilDate,
      }),
      type: ENotificationType.OK,
    })
  }

  const onClickUnset = async () => {
    if (!props.password) {
      notifyMissingPassword()
      return
    }
    if (!username.trim()) {
      setNotification({
        text: t('notification.incorrectFields'),
        type: ENotificationType.INFO,
      })
      return
    }
    const response = await deletePremium(username, props.password)
    if (response.status === 404) {
      handleNotFound(username)
      return
    }
    if (!handleAdminRequest(response)) return
    setNotification({
      text: t('notification.premiumUnset', { username: username.replace(/^@/, '') }),
      type: ENotificationType.OK,
    })
  }

  return (
    <div
      className={props.className}
      {...stylex.props(s.premium)}
    >
      <label
        className='label'
        htmlFor='premium-username'
      >
        {t('label.username')}:
      </label>
      <Input
        id='premium-username'
        placeholder={t('placeholder.botUsername')}
        value={username}
        onInput={setUsername}
      />
      <label
        className='label'
        htmlFor='premium-until'
      >
        {t('label.premiumUntil')}:
      </label>
      <Input
        id='premium-until'
        type='date'
        value={untilDate}
        onInput={setUntilDate}
      />
      <div {...stylex.props(s.actions)}>
        <Button onClick={onClickSet}>{t('button.setPremium')}</Button>
        <Button onClick={onClickUnset}>{t('button.unsetPremium')}</Button>
      </div>
    </div>
  )
}
