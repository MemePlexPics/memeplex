import { useSetAtom } from "jotai";
import { INotificationProps } from "../components/Notification/types";
import { notificationsAtom } from "../store/atoms";
import { useEffect } from "react";

export const useNotification = (notification?: INotificationProps) => {
    const setNotification = useSetAtom(notificationsAtom)

    useEffect(() => {
        if (!notification)
            return
        setNotification(notification)
    }, [notification])

    return setNotification
}
