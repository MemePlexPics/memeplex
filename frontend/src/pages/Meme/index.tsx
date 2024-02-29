import { useParams } from "react-router-dom"
import { useAtomValue, useSetAtom } from 'jotai'

import { memesAtom } from "../../store/atoms"
import { useAdminRequest, useFetch, useMeta, useNotification, useTitle } from "../../hooks"
import { getUrl } from "../../utils"
import { IMeme } from "../../types"
import { ChannelBlock, Input, Loader } from "../../components"

import './style.css'
import { dialogConfirmationAtom } from "../../store/atoms/dialogConfirmationAtom"
import { removeChannel } from "../../services"
import { ENotificationType } from "../../components/Notification/constants"

export const MemePage = () => {
    const { id } = useParams()
    const memes = useAtomValue(memesAtom)
    const setNotification = useNotification()
    const { title } = useTitle(['Meme'])
    const setDialog = useSetAtom(dialogConfirmationAtom)
    const isAdmin = !!localStorage.getItem('isAdmin') 
    const { handleAdminRequest } = useAdminRequest()
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

    const onClickRemoveChannel = () => {
        if (!request.data) return
        let password = ''
        setDialog({
            text: `Remove the channel @${request.data.channel}?`,
            isOpen: true,
            children: <Input
                type='password'
                placeholder='Password'
                required
                onInput={val => {
                    password = val
                }}
            />,
            onClickAccept: async () => {
                if (!password) {

                    setNotification({
                        text: 'Enter password',
                        type: ENotificationType.ERROR
                    })
                    return
                }
                const response = await removeChannel(request.data.channel, password)
                if (!handleAdminRequest(response))
                    return false
                setNotification({
                    text: `The @${request.data.channel} has been successfully removed`,
                    type: ENotificationType.OK
                })
            }
        })
    }

    if (request.isLoading) return <Loader />

    if (request.isError) {
        if (request.status === 204) return <p className="unexisted-meme">This meme is not in the database</p>
        return <p className="error-response">An error occurred, please try later</p>
    }

    if (!request.data) return <p className='nothing-found'>Meme not found</p>

    return (
        <div id="meme">
            <img className="meme-image" src={'/' + request.data.fileName} />
            <div className="meme-description">
                <div className="meme-text">
                    {Object.entries(request.data?.text).map(([_lang, text]) => (
                        <p className="meme-text-lang">
                            <b>Text: </b>
                            {text.split('\n').map(line => (
                                <span>{line}</span>
                            ))}
                        </p>
                    ))}
                </div>
                <div className="meme-source">
                    <p>
                        <b>Source: </b>
                        <ChannelBlock
                            isAdmin={isAdmin}
                            username={request.data.channel}
                            id={request.data.message}
                            className='source-block'
                            onClickRemove={onClickRemoveChannel}
                        />
                    </p>
                </div>
            </div>
        </div>
    )
}
