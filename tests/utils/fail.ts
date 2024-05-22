export const fail = (reason = 'fail was called in a test.'): never => {
  throw new Error(reason)
}
