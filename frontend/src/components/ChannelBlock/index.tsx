import {
  faCheck,
  faEraser,
  faEye,
  faImages,
  faPen,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { s } from './style'

import noAvatarChannel from '@/assets/images/no_avatar_channel.jpg'

export const ChannelBlock = (props: {
  isAdmin?: boolean
  isBrowserPreview?: boolean
  username: string
  status?: 'NOT_AVAILABLE' | 'DISABLED' | null
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
  const [isHovered, setIsHovered] = useState(false)
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

  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = noAvatarChannel
  }

  return (
    <div
      {...stylex.props(
        s.channelBlock,
        props.status === 'NOT_AVAILABLE'
          ? s.isUnavailable
          : props.status === 'DISABLED'
            ? s.isDisabled
            : undefined,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={telegramLink}
        target='_blank'
        {...stylex.props(s.channelInfo)}
      >
        <img
          {...stylex.props(s.avatar, props.size === 'small' ? s.smallAvatar : undefined)}
          src={imgSrc}
          onError={onError}
        />
        <span
          {...stylex.props(s.channelName, props.size === 'small' ? s.smallChannelName : undefined)}
        >
          {props.title ? props.title : `@${props.username}`}
        </span>
      </Link>
      <div
        {...stylex.props(isHovered && props.isAdmin ? s.channelActionsVisible : s.channelActions)}
      >
        {props.onClickImages ? (
          <FontAwesomeIcon
            icon={faImages}
            color='cyan'
            {...stylex.props(s.actionIcon)}
            onClick={onClickImages}
          />
        ) : null}
        {props.onClickCheck ? (
          <FontAwesomeIcon
            icon={faCheck}
            color='green'
            {...stylex.props(s.actionIcon)}
            onClick={onClickCheck}
          />
        ) : null}
        {props.onClickEdit ? (
          <FontAwesomeIcon
            icon={faPen}
            color='blue'
            {...stylex.props(s.actionIcon)}
            onClick={onClickEdit}
          />
        ) : null}
        {props.onClickView ? (
          <FontAwesomeIcon
            icon={faEye}
            {...stylex.props(s.actionIcon)}
            onClick={onClickView}
          />
        ) : null}
        {props.onClickEraser ? (
          <FontAwesomeIcon
            icon={faEraser}
            color='darkorange'
            {...stylex.props(s.actionIcon)}
            onClick={onClickEraser}
          />
        ) : null}
        {props.onClickRemove ? (
          <FontAwesomeIcon
            icon={faTrashCan}
            color='red'
            {...stylex.props(s.actionIcon)}
            onClick={onClickRemove}
          />
        ) : null}
      </div>
    </div>
  )
}
