import { useAtom } from "jotai"
import { memesFilterAtom } from "../../../store/atoms"
import { ChannelBlock } from "../.."
import stylex from '@stylexjs/stylex'
import { s } from "./style"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons"
import { EMemeState } from "../../../types/enums"
import { useTranslation } from "react-i18next"

export const FilterMemes = () => {
    const { t } = useTranslation()
    const [memeFilters, setMemeFilters] = useAtom(memesFilterAtom)

    const onClickChannel = (e: React.MouseEvent, channel: string) => {
        e.preventDefault()
        setMemeFilters(() => ({
            ...memeFilters,
            channel: memeFilters?.channel?.filter(filteredChannel => filteredChannel !== channel),
        }))
    }

    const onClickToogleDeleted = () => {
        setMemeFilters(() => ({
            ...memeFilters,
            not: {
                state: memeFilters?.not?.state === null
                    ? EMemeState.HIDDEN
                    : null,
            },
        }))
    }

    if (!memeFilters) return null

    return <div {...stylex.props(s.filter)}>
        <div {...stylex.props(s.content)}>
            <label {...stylex.props(s.label)}>{t('label.filter')}:</label>
            {memeFilters?.channel?.map(channel => 
                <div onClick={(e) => onClickChannel(e, channel)}>
                    <ChannelBlock
                        username={channel}
                        size='small'
                    />
                </div>
            )}
        </div>
        <div>
            <FontAwesomeIcon
                icon={faEye}
                color={memeFilters?.not?.state !== null ? 'gray' : 'white'}
                size='2x'
                onClick={onClickToogleDeleted}
            />
        </div>
    </div>
}
