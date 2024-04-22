// TODO: /[a-zA-Z_0-9]+/.match(link).at(-1)
export const getTgChannelName = (link: string) =>
  link.replace('https://t.me/', '').replace('/', '').replace('@', '')
