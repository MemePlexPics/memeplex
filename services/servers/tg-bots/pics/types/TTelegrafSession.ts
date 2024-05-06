export type TTelegrafSession = {
  search: {
    nextPage: null | number
    query: null | string
  }
  latest: {
    pagesLeft?: number
    from?: number
    to?: number
  }
}
