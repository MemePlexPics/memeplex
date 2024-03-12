import { EMemeState } from "../../types/enums"
import { getUrl } from "../../utils"

export const setChannelMemesState = async (channel: string, state: EMemeState, password: string) => {
    const response = await fetch(getUrl('/admin/channel/memes/state'), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            channel,
            state,
            password,
        })
    })
    return response
}
