import {
  IconDefinition,
  faCircleInfo,
  faTriangleExclamation,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'

import { ENotificationType } from '.'

export const notificationTypeIcon: Record<
  ENotificationType,
  { icon: IconDefinition; color: string }
> = {
  [ENotificationType.OK]: {
    icon: faCircleCheck,
    color: 'green',
  },
  [ENotificationType.INFO]: {
    icon: faCircleInfo,
    color: 'lightskyblue',
  },
  [ENotificationType.ERROR]: {
    icon: faTriangleExclamation,
    color: 'red',
  },
}
