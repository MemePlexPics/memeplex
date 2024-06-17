import { ENotificationType } from '../constants'

export type INotificationProps = {
  text: string
  type: ENotificationType
  timeMs?: number
  onClose?: (id?: string) => unknown
}
