import classNames from 'classnames'
import './style.css'
import { useLayoutEffect } from 'react'
import { notificationTypeIcon, notificationTypeTimeout } from './constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { INotificationProps } from './types'

export const Notification = (props: INotificationProps) => {
    useLayoutEffect(() => {
        if (!props.onClose) return
        const timeout = setTimeout(props.onClose, props.timeMs || notificationTypeTimeout[props.type])

        return () => clearTimeout(timeout)
    }, [])

    return <>
        <div
            key={props.key}
            className={classNames('notification', props.type)}
            onClick={() => props.onClose?.()}
        >
            <FontAwesomeIcon
                {...notificationTypeIcon[props.type]}
            />
            <div className='notification-text'>
                {props.text.split('\n').map(line => (
                    <span>{line}</span>
                ))}
            </div>
        </div>
    </>
}
