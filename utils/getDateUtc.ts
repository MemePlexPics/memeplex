export function getDateUtc() {
  const now = new Date()
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  return utcNow
}
