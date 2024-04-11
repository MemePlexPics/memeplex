import Fuse from 'fuse.js'
import { removeLastSyllable } from '.'

export const fuseSearch = (list: readonly string[], query: string) => {
  const fuseOptions = {
    isCaseSensitive: false,
    // sortFn: (a, b) => b.score - a.score, // descending
    threshold: 0.1,
    ignoreLocation: true,
  }

  let processedQuery = query
  if (query.length >= 7 && /^[a-zА-Я]+$/i.test(query)) {
    const trimmedQuery = removeLastSyllable(query)
    if (trimmedQuery && trimmedQuery !== query) {
      processedQuery = trimmedQuery
      fuseOptions.threshold = 0
    }
  }
  if (query.length <= 4) {
    fuseOptions.threshold = 0
  }
  const fuse = new Fuse(list, {
    ...fuseOptions,
    includeScore: true,
  })
  return fuse.search(processedQuery)
}
