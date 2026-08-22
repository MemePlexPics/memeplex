export const toBotUsername = (username: string): `@${string}` => {
  const trimmed = username.trim()
  return (trimmed.startsWith('@') ? trimmed : `@${trimmed}`) as `@${string}`
}
