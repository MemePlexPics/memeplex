import {
  bewareOfThePipeline,
  cars,
  commercials,
  marina,
  russianPadezhi,
  schizophrenia,
} from './fuseMock'

export const fuseCases: {
  query: string
  expected?: string[]
  notExpected?: string[]
}[] = [
  { query: 'марина', expected: [marina] },
  { query: 'beware of the pipeline', expected: [bewareOfThePipeline] },
  { query: 'шизофреник', expected: [schizophrenia] },
  { query: 'car', expected: [cars] },
  { query: 'русский', expected: russianPadezhi },
  { query: 'cia', expected: [commercials] },
  { query: 'which', expected: [] },
  { query: 'where', expected: [] },
  { query: 'usa', expected: [] },
  { query: 'you', expected: [] },
  { query: 'porn', expected: [] },
  { query: 'когда', expected: [] },
]
