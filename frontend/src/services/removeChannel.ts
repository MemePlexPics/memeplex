import { getUrl } from "../utils"

export const removeChannel = async (channel: string, password: string) => {
    const response = await fetch(getUrl('/admin/channel'), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            channel,
            password,
        })
    })
    return response
}
