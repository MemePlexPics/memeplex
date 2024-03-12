import { getUrl } from "../utils"

export const getFeaturedChannel = async (username: string, password: string) => {
    const response = await fetch(getUrl('/admin/featuredChannel/get'), {
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
