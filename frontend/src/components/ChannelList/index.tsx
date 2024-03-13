import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChannelBlock, PaginatedList } from '..'
import { useFetch } from '../../hooks'
import { TGetChannelList } from '../../types'
import { getUrl } from '../../utils'

type TChannelListProps =
  | {
      isAdmin?: false
      filter?: string
      updateSwitch?: boolean
    }
  | {
      isAdmin: true
      filter?: string
      updateSwitch: boolean
      onClickImages: (channel: string) => unknown
      onClickEraser: (channel: string) => unknown
      onRemoveChannel: (channel: string) => unknown
    }

export const ChannelList = (props: TChannelListProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const request = useFetch<TGetChannelList>(
    () =>
      getUrl('/getChannelList', {
        page: '' + page,
        onlyAvailable: `${props.isAdmin !== true}`,
        filter: props.filter,
      }),
    {
      deps: [page, props.updateSwitch, props.filter],
    },
  )

  const onClickRemove = async (channel: string) => {
    if (!props.isAdmin) return
    await props.onRemoveChannel(channel)
  }

  const onClickImages = async (channel: string) => {
    if (!props.isAdmin) return
    await props.onClickImages(channel)
  }

  const onClickEraser = async (channel: string) => {
    if (!props.isAdmin) return
    await props.onClickEraser(channel)
  }

  return (
    <PaginatedList
      page={page}
      totalPages={request.data?.totalPages}
      isLoading={request.isLoading}
      onChangePage={setPage}
    >
      {request.isLoaded && !request.data?.result.length ? (
        <h3 style={{ color: 'white' }}>{t('label.nothingFound')}</h3>
      ) : request.data ? (
        request.data.result.map(channel => (
          <li key={channel.name}>
            <ChannelBlock
              isAdmin={props.isAdmin}
              username={channel.name}
              availability={channel.availability}
              onClickImages={props.isAdmin ? () => onClickImages(channel.name) : undefined}
              onClickEraser={props.isAdmin ? () => onClickEraser(channel.name) : undefined}
              onClickRemove={props.isAdmin ? () => onClickRemove(channel.name) : undefined}
            />
          </li>
        ))
      ) : null}
    </PaginatedList>
  )
}
