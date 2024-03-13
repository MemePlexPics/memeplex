import { EMemeState } from '../../types/enums'
import { getUrl } from '../../utils'

export const setMemeState = async (id: string, state: EMemeState, password: string) => {
  const response = await fetch(getUrl('/admin/meme/state'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      state,
      password,
    }),
  })
  return response
}
