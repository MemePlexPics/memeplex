import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons"

import './style.css'
import noAvatarChannel from './assets/no_avatar_channel.jpg'
import classNames from "classnames"

export const ChannelBlock = (props: {
    isAdmin?: boolean
    isBrowserPreview?: boolean
    channel: string
    id?: string
    className?: string
    onClickCheck?: (name: string) => unknown
    onClickRemove?: (name: string) => unknown
}) => {
    const imgSrc = `/data/avatars/${props.channel}.jpg`
    const channelLink = props.isBrowserPreview
        ? `s/${props.channel}`
        : props.channel
    const telegramLink = ['https://t.me', channelLink, props.id].join('/')

    const onClickRemove = () => {
        props.onClickRemove?.(props.channel)
    }

    const onClickCheck = () => {
        props.onClickCheck?.(props.channel)
    }

    const onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = noAvatarChannel;
    }

    return (
        <div className={classNames("channel-block", { isAdmin: props.isAdmin }, props.className)}>
            <Link
                to={telegramLink}
                target="_blank"
                className="channel-info"
            >
                <img
                    className="avatar"
                    src={imgSrc}
                    onError={(e) => onError(e)}
                />
                <span className="channel-name">
                    @{props.channel}
                </span>
            </Link>
                <div className="channel-actions">
                    {props.onClickCheck
                        ? <FontAwesomeIcon
                        icon={faCheck}
                        color="green"
                        onClick={onClickCheck}
                        />
                        : null}
                    {props.onClickRemove
                        ?
                        <FontAwesomeIcon
                        icon={faTrashCan}
                        color="red"
                        onClick={onClickRemove}
                        />
                        : null}
                </div>
        </div>
    )
}
