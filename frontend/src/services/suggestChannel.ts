import { getUrl } from "../utils"

export const suggestChannel = async (channel: string) => {
    const response = await fetch(getUrl('/suggestChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
        })
    })
    return response
}
