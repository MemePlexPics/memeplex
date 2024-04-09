import Fuse from 'fuse.js'
import { fuseOptions } from '../constants'
import { fuseMock } from './constants'

const testCases: { query: string; expected: string[] }[] = [
  { query: 'марина', expected: [fuseMock[0], fuseMock[1]] },
  { query: 'beware of the pipeline', expected: [fuseMock[2]] },
]

describe('Fuse.js tests', () => {
  let fuse: Fuse<string>

  beforeAll(() => {
    fuse = new Fuse(fuseMock, {
      ...fuseOptions,
      includeScore: true,
    })
  })

  testCases.forEach(({ query, expected }) => {
    test(`Search for "${query}"`, () => {
      const results = fuse.search(query)
      const found = results.map(result => result.item)
      expect(found).toEqual(expected)
    })
  })
})
