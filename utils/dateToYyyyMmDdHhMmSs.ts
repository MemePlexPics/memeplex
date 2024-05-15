export function dateToYyyyMmDdHhMmSs(date: string | number | Date) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}
