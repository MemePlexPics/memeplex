import { getUrl } from '../../utils'

export const putPremium = async (username: string, untilDate: string, password: string) => {
  const response = await fetch(getUrl('/admin/premium'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      untilDate,
      password,
    }),
  })
  return response
}

export const deletePremium = async (username: string, password: string) => {
  const response = await fetch(getUrl('/admin/premium'), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
  return response
}
