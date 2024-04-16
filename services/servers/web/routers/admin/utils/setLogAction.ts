import { TResponse } from '../types'

export const setLogAction = (res: TResponse, action: string) => {
  res.locals.logAction = action
}
