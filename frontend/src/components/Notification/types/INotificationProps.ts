import { ENotificationType } from '../constants'

export interface INotificationProps {
  text: string
  type: ENotificationType
  timeMs?: number
  onClose?: (id?: string) => unknown
}
