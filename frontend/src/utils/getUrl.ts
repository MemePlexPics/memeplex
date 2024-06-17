export const getUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const protocol = window.location.protocol
  const host = window.location.host
  const url = new URL(`${protocol}//${host}${path}`)
  if (params)
    Object.keys(params).forEach(param => {
      const value = params[param]
      if (value) url.searchParams.append(param, `${value}`)
    })
  return url
}
