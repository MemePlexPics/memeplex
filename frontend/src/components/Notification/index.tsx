import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { useLayoutEffect } from 'react'

import { notificationTypeIcon, notificationTypeTimeout } from './constants'
import { INotificationProps } from './types'
import './style.css'

export const Notification = (props: INotificationProps) => {
  useLayoutEffect(() => {
    if (!props.onClose) return
    const timeout = setTimeout(props.onClose, props.timeMs ?? notificationTypeTimeout[props.type])

    return () => { clearTimeout(timeout); }
  }, [])

  return (
    <div
        key={props.key}
        className={classNames('notification', props.type)}
        onClick={() => props.onClose?.()}
      >
        <FontAwesomeIcon {...notificationTypeIcon[props.type]} />
        <div className='notification-text'>
          {props.text.split('\n').map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      </div>
  )
}
