import { fuseCases, fuseMock } from './constants'
import { fuseSearch } from '../utils'

describe('Fuse.js tests', () => {
  fuseCases.forEach(({ query, expected, notExpected }) => {
    test(`Search for "${query}"`, () => {
      const results = fuseSearch(fuseMock, query)
      console.log(query, results)
      const found = results.map(result => result.item)
      if (expected) {
        expect(found).toEqual(expected)
      }
      if (notExpected) {
        expect(found).not.toEqual(notExpected)
      }
    })
  })
})
