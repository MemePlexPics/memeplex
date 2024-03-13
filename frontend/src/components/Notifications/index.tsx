import { useEffect, useRef, useState } from 'react'
import { Notification } from '..'
import './style.css'
import { useAtomValue } from 'jotai'
import { notificationsAtom } from '../../store/atoms'
import { TNotification } from './types'

export const Notifications = () => {
  const incomingNotification = useAtomValue(notificationsAtom)
  const [notifications, setNotifications] = useState<TNotification[]>([])
  const queue = useRef<TNotification[]>([])

  useEffect(() => {
    if (!incomingNotification) return
    const id = self.crypto.randomUUID()
    if (notifications.length > 5)
      queue.current.push({
        id,
        ...incomingNotification,
      })
    else
      setNotifications(prev => [
        ...prev,
        {
          id,
          ...incomingNotification,
        },
      ])
  }, [incomingNotification])

  useEffect(() => {
    if (queue.current.length > 0 && notifications.length < 5) {
      const notificationFromQueue = queue.current.shift()!
      setNotifications(() => [notificationFromQueue, ...notifications])
    }
  }, [notifications])

  const onClose = (id?: string) => {
    const notOutdatedNotifications = notifications.filter(notification => notification.id !== id)
    setNotifications(() => notOutdatedNotifications)
  }

  return (
    <>
      <div id='notifications'>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            text={notification.text}
            type={notification.type}
            onClose={() => onClose(notification.id)}
          />
        ))}
      </div>
    </>
  )
}
