import { useState } from "react"

import { ChannelBlock, PaginatedList } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"
import { IFeaturedChannel, TGetFeaturedChannelList } from "../../types"

export const FeaturedChannelList = (props: {
    isAdmin?: boolean
    updateSwitch?: boolean
    className?: string
    withoutLoader?: boolean
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
            isLoading={!props.withoutLoader && request.isLoading}
            className={props.className}
            orientation={props.isAdmin ? 'vertical' : "horizontal"}
            onChangePage={setPage}
        >
            {request.isLoaded && !request.data?.result.length
                ? <h3 style={{ color: 'white' }}>
                    {props.isAdmin
                        ? 'Nothing found'
                        : 'Make your channel the first, click on the button'
                    }
                </h3>
                : request.data
                    ? request.data.result.map(channel => (
                        <li key={channel.username}>
                            <ChannelBlock
                                isAdmin={props.isAdmin}
                                username={channel.username}
                                title={channel.title}
                                size={props.isAdmin ? 'normal' : 'small'}
                                onClickView={() => onClickAction(channel, 'view')}
                                onClickRemove={() => onClickAction(channel, 'remove')}
                            />
                        </li>
                    ))
                    : null
            }
        </PaginatedList>
    )
}
