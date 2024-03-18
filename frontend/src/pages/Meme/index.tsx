import { useNavigate, useParams } from "react-router-dom"
import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import { adminPasswordAtom, memesAtom, memesFilterAtom } from "../../store/atoms"
import { useAdminRequest, useClickOutside, useFetch, useMeta, useNotification, useTitle } from "../../hooks"
import { getUrl } from "../../utils"
import { IMeme } from "../../types"
import { ChannelBlock, Loader } from "../../components"

import stylex from '@stylexjs/stylex'
import { s } from './style'
import { dialogConfirmationAtom } from "../../store/atoms/dialogConfirmationAtom"
import { removeChannel } from "../../services"
import { ENotificationType } from "../../components/Notification/constants"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { setMemeState } from "../../services/admin"
import { EMemeState } from "../../types/enums"
import { useRef, useState } from "react"
import { InputPassword } from "../../components/molecules"

export const MemePage = () => {
    const { id } = useParams()
    const { t } = useTranslation()
    const imgRef = useRef(null)
    const password = useAtomValue(adminPasswordAtom)
    const [memes, setMemes] = useAtom(memesAtom)
    const setNotification = useNotification()
    const { title } = useTitle(['Meme'])
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const isAdmin = !!localStorage.getItem('isAdmin')
    const [isMemeActionShown, setIsMemeActionShown] = useState(false)
    const { handleAdminRequest } = useAdminRequest()
    const setMemeFilters = useSetAtom(memesFilterAtom)
    const navigate = useNavigate()
    const request = useFetch<IMeme>(
        () => getUrl('/getMeme', { id }),
        {
            deps: [id],
            getCached: () => {
                return memes.length
                    ? memes.find(meme => meme?.id === id) || null
                    : null
            }
        }
    )

    useMeta([
        {
            name: 'og:description',
            content: request.data?.text.eng || '',
        },
        {
            name: 'description',
            content: request.data?.text.eng || '',
        },
        {
            name: "og:title",
            content: title,
        },
        {
            name: "og:url",
            content: window.location.href,
        },
        {
            name: "og:image",
            content: request.data?.fileName || '',
        },
    ])

    useClickOutside(imgRef, () => {
        setIsMemeActionShown(false)
    })

    const checkPassword = (password: string) => {
        if (!password) {
            setNotification({
                text: t('notification.enterPassword'),
                type: ENotificationType.ERROR
            })
            return false
        }
        return true
    }

    const handleRemoveChannel = async (password: string, channel: string) => {
        if (!checkPassword) return
        const response = await removeChannel(channel, password)
        if (!handleAdminRequest(response))
            return false
        setNotification({
            text: t('notification.channelRemoved', { channel: channel}),
            type: ENotificationType.OK
        })
    }

    const handleRemoveMeme = async (password: string, id: string) => {
        if (!checkPassword) return
        const response = await setMemeState(id, EMemeState.HIDDEN, password)
        if (!handleAdminRequest(response))
            return false
        setNotification({
            text: t('notification.memeRemoved', { id }),
            type: ENotificationType.OK
        })
    }

    const onClickRemoveMeme = async () => {
        if (!id) return
        setDialog({
            text: `${t('notification.removeMeme')} ${id}?`,
            isOpen: true,
            children: <InputPassword />,
            onClickAccept: () => handleRemoveMeme(password, id)
        })
    }

    const onClickRemoveChannel = () => {
        if (!request.data) return
        setDialog({
            text: `${t('notification.removeChannel')} @${request.data.channel}?`,
            isOpen: true,
            children: <InputPassword />,
            onClickAccept: () => handleRemoveChannel(password, request.data.channel)
        })
    }

    const onClickChannelImages = () => {
        if (!request.data) return
        setMemeFilters({ channel: [request.data.channel] })
        setMemes([])
        navigate('/')
    }

    if (request.isLoading) return <Loader />
    if (request.status === 204) return <p {...stylex.props(s.messageText)}>{t('label.unexistedMeme')}</p>
    if (request.isError || !request.data) return <p {...stylex.props(s.messageText)}>{t('label.errorOccured')}</p>

    return (
        <div {...stylex.props(s.meme)}>
            <div {...stylex.props(s.memeImageContainer)}>
                <img
                    {...stylex.props(s.memeImage)}
                    ref={imgRef}
                    src={'/' + request.data.fileName}
                    onClick={() => setIsMemeActionShown(!isMemeActionShown)}
                />
                {isMemeActionShown
                    ? <div {...stylex.props(s.memeActions)}>
                        <FontAwesomeIcon
                            icon={faTrash}
                            color='red'
                            size="5x"
                            {...stylex.props(s.trashIcon)}
                            onClick={onClickRemoveMeme}
                        />
                    </div>
                    : null
                }
            </div>
            <div {...stylex.props(s.memeDescription)}>
                <div>
                {Object.entries(request.data?.text).map(([lang, text]) => (
                    <p key={lang} {...stylex.props(s.memeTextLang)}>
                    <b>{t('label.text')}: </b>
                    {text.split('\n').map((line, i) => (
                        <span key={i}>{line}</span>
                    ))}
                    </p>
                ))}
                </div>
                <div>
                <b>{t('label.source')}: </b>
                <ChannelBlock
                    isAdmin={isAdmin}
                    username={request.data.channel}
                    id={request.data.message}
                    {...stylex.props(s.sourceBlock)}
                    onClickImages={onClickChannelImages}
                    onClickRemove={onClickRemoveChannel}
                />
                </div>
            </div>
        </div>
    )
}
