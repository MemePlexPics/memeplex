import { useRef, useState } from "react"

import { ChannelBlock, Loader, Pagination } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"

import './style.css'
import { IGetChannelList } from "./types"

type TChannelListProps =
| {
    isAdmin?: false
    updateSwitch?: boolean
}
| {
    isAdmin: true
    updateSwitch: boolean
    onRemoveChannel: (channel: string) => Promise<unknown>
}

export const ChannelList = (props: TChannelListProps) => {
    const [page, setPage] = useState(1)
    const channelListRef = useRef<HTMLDivElement>(null)
    const request = useFetch<IGetChannelList>(
        () => getUrl('/getChannelList', {
                page: '' + page,
                onlyAvailable: `${props.isAdmin !== true}`,
            }
        ), {
            deps: [page, props.updateSwitch]
        }
    )

    const onClickRemove = async (channel: string) => {
        if (!props.isAdmin)
            return
        await props.onRemoveChannel(channel)
    }

    return (
        <div id='channel-list' ref={channelListRef}>
            <ul>
                {request.isLoaded && !request.data?.result.length
                    ? <h3 style={{ color: 'white' }}>Nothing found</h3>
                    : request.data
                        ? request.data.result.map(channel => (
                            <li key={channel.name}>
                                <ChannelBlock isAdmin={props.isAdmin} channel={channel.name} onClickRemove={props.isAdmin
                                    ? () => onClickRemove(channel.name)
                                    : undefined
                                } />
                            </li>
                        ))
                        : null
                }
            </ul>
            {request.data?.totalPages && request.data.totalPages > 1
                ? <Pagination
                    page={page}
                    pagesAtTime={9}
                    pagesTotal={request.data.totalPages}
                    scrollToIdAfterChangePage={channelListRef}
                    onChangePage={setPage}
                />
                : null}
            <Loader state={request.isLoading} />
        </div>
    )
}
