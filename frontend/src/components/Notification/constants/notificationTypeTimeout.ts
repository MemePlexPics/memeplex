import { ENotificationType } from '.'

export const notificationTypeTimeout: Record<ENotificationType, number> = {
  [ENotificationType.OK]: 3000,
  [ENotificationType.INFO]: 5000,
  [ENotificationType.ERROR]: 7000,
}
