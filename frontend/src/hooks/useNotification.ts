import { useSetAtom } from 'jotai'

import { useEffect } from 'react'

import { INotificationProps } from '../components/Notification/types'
import { notificationsAtom } from '../store/atoms'

export const useNotification = (notification?: INotificationProps) => {
  const setNotification = useSetAtom(notificationsAtom)

  useEffect(() => {
    if (!notification) return
    setNotification(notification)
  }, [notification])

  return setNotification
}
