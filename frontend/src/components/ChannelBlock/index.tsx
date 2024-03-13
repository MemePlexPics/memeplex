import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEraser,
  faEye,
  faImages,
  faPen,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'

import './style.css'
import noAvatarChannel from './assets/no_avatar_channel.jpg'
import classNames from 'classnames'

export const ChannelBlock = (props: {
  isAdmin?: boolean
  isBrowserPreview?: boolean
  username: string
  availability?: number
  title?: string
  size?: 'normal' | 'small'
  id?: string
  className?: string
  onClickImages?: (username: string) => unknown
  onClickCheck?: (username: string) => unknown
  onClickEdit?: (username: string) => unknown
  onClickEraser?: (username: string) => unknown
  onClickView?: (username: string) => unknown
  onClickRemove?: (username: string) => unknown
}) => {
  const imgSrc = `/data/avatars/${props.username}.jpg`
  const channelLink = props.isBrowserPreview ? `s/${props.username}` : props.username
  const telegramLink = ['https://t.me', channelLink, props.id].join('/')

  const onClickRemove = () => {
    props.onClickRemove?.(props.username)
  }

  const onClickCheck = () => {
    props.onClickCheck?.(props.username)
  }

  const onClickEdit = () => {
    props.onClickEdit?.(props.username)
  }

  const onClickView = () => {
    props.onClickView?.(props.username)
  }

  const onClickImages = () => {
    props.onClickImages?.(props.username)
  }

  const onClickEraser = () => {
    props.onClickEraser?.(props.username)
  }

  const onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = noAvatarChannel
  }

  return (
    <div
      className={classNames(
        'channel-block',
        {
          isAdmin: props.isAdmin,
          isUnavailable: props.availability === 0 ? true : false,
        },
        props.className,
        props.size,
      )}
    >
      <Link
        to={telegramLink}
        target='_blank'
        className='channel-info'
      >
        <img
          className='avatar'
          src={imgSrc}
          onError={e => onError(e)}
        />
        <span className='channel-name'>{props.title ? props.title : `@${props.username}`}</span>
      </Link>
      <div className='channel-actions'>
        {props.onClickImages ? (
          <FontAwesomeIcon
            icon={faImages}
            color='cyan'
            onClick={onClickImages}
          />
        ) : null}
        {props.onClickCheck ? (
          <FontAwesomeIcon
            icon={faCheck}
            color='green'
            onClick={onClickCheck}
          />
        ) : null}
        {props.onClickEdit ? (
          <FontAwesomeIcon
            icon={faPen}
            color='blue'
            onClick={onClickEdit}
          />
        ) : null}
        {props.onClickView ? (
          <FontAwesomeIcon
            icon={faEye}
            onClick={onClickView}
          />
        ) : null}
        {props.onClickEraser ? (
          <FontAwesomeIcon
            icon={faEraser}
            color='darkorange'
            onClick={onClickEraser}
          />
        ) : null}
        {props.onClickRemove ? (
          <FontAwesomeIcon
            icon={faTrashCan}
            color='red'
            onClick={onClickRemove}
          />
        ) : null}
      </div>
    </div>
  )
}
