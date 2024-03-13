export const getEndPageNumbers = (
  currentPage: number,
  pagesAtTime: number,
  maxPage: number,
): { from: number; to: number } => {
  let firstPage: number = Math.max(currentPage - pagesAtTime, 1)
  let lastPage: number = Math.min(currentPage + pagesAtTime, maxPage)

  while (lastPage - firstPage >= pagesAtTime) {
    if (currentPage - firstPage > lastPage - currentPage) {
      firstPage += 1
      continue
    }
    lastPage -= 1
  }

  return {
    from: firstPage,
    to: lastPage,
  }
}
