export function getRandomElement<GArrayType>(arr: GArrayType[]) {
  if (arr && arr.length) {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
  }
  return null
}
