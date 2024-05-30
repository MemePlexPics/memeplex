export const remapSetObjectValuesToArrays = <GSetElement>(
  objectWithSet: Record<string, Set<GSetElement>>,
) => Object.entries(objectWithSet).reduce<Record<string, GSetElement[]>>(
  (acc, [keyword, channelIds]) => {
    acc[keyword] = [...channelIds]
    return acc
  },
  {},
)
