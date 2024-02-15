import { useState } from "react"
import { Link } from "react-router-dom"

import { Button, Input, Loader, Pagination } from "../../components"
import { getTgChannelName, getUrl } from "../../utils"
import { useFetch } from "../../hooks"

import './style.css'
export const ChannelList = () => {
    const [channelSuggestion, setChannelSuggestion] = useState('')
    const [page, setPage] = useState(1)
    const request = useFetch<{ result: string[], totalPages: number }>(
        () => getUrl('/getChannelList', { page: '' + page }), {
            deps: [page]
        })

    const onClickSubmit = async () => {
        const channel = getTgChannelName(channelSuggestion)
        if (!channel) return
        const response = await fetch(getUrl('/suggestChannel'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channel })
        })
        if (response.status === 500) {
            const error = await response.json()
            console.error(error)
            return
        }
        alert('Thank you for the suggestion')
        setChannelSuggestion('')
    }

    return (
        <div id="channel-list-page">
            <div className="suggest-channel">
                <label>Suggest channel: </label>
                <Input
                    value={channelSuggestion}
                    onInput={setChannelSuggestion}
                    placeholder='@name or https://t.me/name'
                />
                <Button onClick={onClickSubmit}>Suggest</Button>
            </div>
            {!request.isLoading 
                ? <div id='channel-list'>
                    <ol start={(page - 1) * 100}>
                        {request.data?.result.map(channel => (
                            <li>
                                <Link to={`https://t.me/${channel}`}>
                                    {channel}
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <Pagination
                        page={page}
                        pagesAtTime={9}
                        pagesTotal={request.data?.totalPages || 1}
                        onChangePage={setPage}
                    />
                </div>
                : null
            }
            <Loader state={request.isLoading} />
        </div>
    )
}
