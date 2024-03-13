import { ENotificationType } from '../constants'

export interface INotificationProps {
  key?: React.Key
  text: string
  type: ENotificationType
  timeMs?: number
  onClose?: (id?: string) => unknown
}
