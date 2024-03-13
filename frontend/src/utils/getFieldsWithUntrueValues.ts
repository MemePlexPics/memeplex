export const getFieldsWithUntrueValues = (object: Object) => {
  return Object.entries(object).reduce((acc, [field, value]) => {
    if (!value) acc.push(field)
    return acc
  }, [] as string[])
}
