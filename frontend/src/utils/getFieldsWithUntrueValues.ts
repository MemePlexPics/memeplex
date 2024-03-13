export const getFieldsWithUntrueValues = (object: object) => {
  return Object.entries(object).reduce<string[]>((acc, [field, value]) => {
    if (!value) acc.push(field)
    return acc
  }, [])
}
