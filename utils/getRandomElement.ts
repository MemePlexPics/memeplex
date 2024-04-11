export function getRandomElement(arr) {
  if (arr && arr.length) {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
  }
  return null
}
