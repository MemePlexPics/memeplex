import { useState } from "react"

import { ChannelBlock, PaginatedList } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"
import { IFeaturedChannel, TGetFeaturedChannelList } from "../../types"

export const FeaturedChannelList = (props: {
    isAdmin?: boolean
    updateSwitch?: boolean
    onAction?: (channel: IFeaturedChannel, action: 'remove' | 'view') => Promise<unknown>
}) => {
    const [page, setPage] = useState(1)
    const request = useFetch<TGetFeaturedChannelList>(
        () => getUrl('/getFeaturedChannelList', {
                page: '' + page,
            }
        ), {
            deps: [page, props.updateSwitch]
        }
    )

    const onClickAction = async (channel: IFeaturedChannel, action: 'remove' | 'view') => {
        await props.onAction?.(channel, action)
    }

    return (
        <PaginatedList
            page={page}
            totalPages={request.data?.totalPages}
            isLoading={request.isLoading}
            onChangePage={setPage}
        >
            {request.data?.result.length 
                ? request.data?.result.map(channel => (
                    <li key={channel.username}>
                        <ChannelBlock
                            isAdmin={props.isAdmin}
                            isBrowserPreview
                            username={channel.username}
                            title={channel.title}
                            onClickView={() => onClickAction(channel, 'view')}
                            onClickRemove={() => onClickAction(channel, 'remove')}
                        />
                    </li>
                ))
                : <h3 style={{ color: 'white' }}>Nothing found</h3>
            }
        </PaginatedList>
    )
}
