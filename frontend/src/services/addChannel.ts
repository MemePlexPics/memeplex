import { getUrl } from "../utils"

export const addChannel = async (channel: string, langs: string[], password: string) => {
    const response = await fetch(getUrl('/addChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          langs,
          password,
        })
    })
    return response
}
