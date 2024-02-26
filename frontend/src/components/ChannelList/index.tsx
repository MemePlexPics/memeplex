import { useState } from "react"

import { ChannelBlock, PaginatedList } from ".."
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"
import { TGetChannelList } from "../../types"

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
    const request = useFetch<TGetChannelList>(
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
        <PaginatedList
            page={page}
            totalPages={request.data?.totalPages}
            isLoading={request.isLoading}
            onChangePage={setPage}
        >
            {request.isLoaded && !request.data?.result.length
                ? <h3 style={{ color: 'white' }}>Nothing found</h3>
                : request.data
                    ? request.data.result.map(channel => (
                        <li key={channel.name}>
                            <ChannelBlock
                                isAdmin={props.isAdmin}
                                username={channel.name}
                                onClickRemove={props.isAdmin
                                    ? () => onClickRemove(channel.name)
                                    : undefined
                                }
                            />
                        </li>
                    ))
                    : null
            }
        </PaginatedList>
    )
}
