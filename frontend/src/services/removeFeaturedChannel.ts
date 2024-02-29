import { getUrl } from "../utils"

export const removeFeaturedChannel = async (username: string, password: string) => {
    const response = await fetch(getUrl('/removeFeaturedChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        })
    })
    return response
}
