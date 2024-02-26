import { atom } from "jotai"
import { INotificationProps } from "../../components/Notification/types"

export const notificationsAtom = atom<INotificationProps | null>(null)
