import { getUrl } from '../../utils'

export const putBlacklist = async (words: string, password: string) => {
  const response = await fetch(getUrl('/admin/blacklist'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      words,
      password,
    }),
  })
  return response
}
