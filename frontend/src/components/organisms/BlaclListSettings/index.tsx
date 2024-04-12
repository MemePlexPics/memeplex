import stylex from '@stylexjs/stylex'
import { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next"

import { s } from './style'

import { ENotificationType } from '@/components/Notification/constants'
import { Button, Textarea } from "@/components/atoms"
import { useAdminRequest, useFetch, useNotification } from "@/hooks"
import { putBlacklist } from '@/services/admin'
import { getUrl } from "@/utils"

export const BlaclListSettings = (props: {
  password: string
  className?: string
}) => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  const [blacklist, setBlacklist] = useState('')
  const { handleAdminRequest } = useAdminRequest()
  const request = useFetch<{ words: string }>(
    () =>
      getUrl('/blacklist', {
      }),
    {
      deps: [],
    },
  )

  const handleBlacklistSubmit = async (blacklist: string) => {
    const response = await putBlacklist(blacklist, props.password)
    if (!handleAdminRequest(response)) return false
    setNotification({
      text: t('notification.blacklistUpdated'),
      type: ENotificationType.OK,
    })
    return true
  }

  const onClickSubmit = async () => {
    if (!props.password) {
      setNotification({
        text: t('notification.enterPassword'),
        type: ENotificationType.ERROR,
      })
      return false
    }
    return await handleBlacklistSubmit(blacklist)
  }

  useEffect(() => {
    if (request.data) {
      setBlacklist(request.data.words)
    }
  }, [request.data])

  return <div {...stylex.props(s.blacklist)}>
    <Textarea
        rows={20}
        cols={40}
        value={blacklist}
        onChange={e => setBlacklist(e.target.value)}
    />
    <Button onClick={onClickSubmit}>
      {t('button.submit')}
    </Button>
  </div>
}
