import { IFuseOptions } from "fuse.js"

export const fuseOptions: IFuseOptions<string> = {
  isCaseSensitive: false,
  // sortFn: (a, b) => b.score - a.score, // descending
  threshold: .1,
  ignoreLocation: true,
}
