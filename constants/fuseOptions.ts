import { IFuseOptions } from "fuse.js"

export const fuseOptions: IFuseOptions<string> = {
  isCaseSensitive: false,
  includeScore: true,
  sortFn: (a, b) => b.score - a.score, // descending
  threshold: .6,
}
