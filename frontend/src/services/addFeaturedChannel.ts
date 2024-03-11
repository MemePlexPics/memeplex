import { IFeaturedChannel } from "../types"
import { getUrl } from "../utils"

export const addFeaturedChannel = async (channel: IFeaturedChannel, password: string) => {
    const response = await fetch(getUrl('/admin/featuredChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...channel,
          password,
        })
    })
    return response
}
