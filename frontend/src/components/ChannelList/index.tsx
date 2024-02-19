import { useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import { Loader, Pagination } from ".."
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
    onRemoveChannel: (channel: string) => Promise<boolean>
}

export const ChannelList = (props: TChannelListProps) => {
    const [page, setPage] = useState(1)
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
        <div id='channel-list'>
            <ul>
                {request.isLoaded 
                    ? !request.data?.result.length
                        ? <h3 style={{ color: 'white' }}>Nothing found</h3>
                        : request.data.result.map(channel => (
                            <li key={channel.name}>
                                <Link to={`https://t.me/${channel.name}`}>
                                    @{channel.name}
                                </Link>
                                {props.isAdmin
                                    ? <div className="channel-actions">
                                        <FontAwesomeIcon
                                            icon={faTrashCan}
                                            color="red"
                                            onClick={() => onClickRemove(channel.name)}
                                        />
                                    </div>
                                    : null}
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
                    onChangePage={setPage}
                />
                : null}
            <Loader state={request.isLoading} />
        </div>
    )
}
