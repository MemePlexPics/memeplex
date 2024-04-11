export function dateToYyyyMmDdHhMmSs(date) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}
