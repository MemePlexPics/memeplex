import { useState } from "react"
import { Link } from "react-router-dom"

import { Loader, Pagination } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"

import './style.css'
import { IGetChannelList } from "./types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrashCan, faCheck } from "@fortawesome/free-solid-svg-icons"

export const ChannelSuggestionList = (props: {
    updateSwitch: boolean
    onSuggestionAction: (channel: string, action: 'add' | 'remove') => Promise<boolean>
}) => {
    const [page, setPage] = useState(1)
    const request = useFetch<IGetChannelList>(
        () => getUrl('/getChannelSuggestionList', {
                page: '' + page,
            }
        ), {
            deps: [page, props.updateSwitch]
        }
    )

    const onClickAction = async (channel: string, action: 'add' | 'remove') => {
        await props.onSuggestionAction(channel, action)
    }

    return (
        <div id='channel-list'>
            <ul>
                {request.data?.result.length 
                    ? request.data?.result.map(channel => (
                        <li key={channel.name}>
                            <Link to={`https://t.me/${channel.name}`} target="_blank">
                                @{channel.name}
                            </Link>
                                <div className="channel-actions">
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        color="green"
                                        onClick={() => onClickAction(channel.name, 'add')}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        color="red"
                                        onClick={() => onClickAction(channel.name, 'remove')}
                                    />
                                </div>
                        </li>
                    ))
                    : <h3 style={{ color: 'white' }}>Nothing found</h3>
                }
            </ul>
            {request.data?.totalPages && request.data.totalPages > 1
                ? <Pagination
                    page={page}
                    pagesAtTime={9}
                    pagesTotal={request.data.totalPages}
                    onChangePage={setPage}
                />
                : null}
            <Loader state={request.isLoading} />
        </div>
    )
}
