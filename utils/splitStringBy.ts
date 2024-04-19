export const splitStringBy = (string: string, delimiters: string[]): string[] => {
  const regex = new RegExp(delimiters.map(delimiter => `\\${delimiter}`).join('|'), 'g')
  return string.split(regex)
}
