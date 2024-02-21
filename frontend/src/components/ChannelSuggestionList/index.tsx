import { useState } from "react"

import { ChannelBlock, Loader, Pagination } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"

import './style.css'
import { IGetChannelList } from "./types"

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
                            <ChannelBlock
                                isAdmin
                                isBrowserPreview
                                channel={channel.name}
                                onClickCheck={(name) => onClickAction(name, 'add')}
                                onClickRemove={(name) => onClickAction(name, 'remove')}
                            />
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
