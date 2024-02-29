import { useSetAtom } from "jotai"
import { useNotification } from "."
import { ENotificationType } from "../components/Notification/constants"
import { passwordAtom } from "../store/atoms"

export const useAdminRequest = () => {
  const setNotification = useNotification()
  const setPassword = useSetAtom(passwordAtom)

  const handleAdminRequest = (response: Response) => {
    if (response.status === 403) {
      setPassword('');
      setNotification({
        text: 'Incorrect password!',
        type: ENotificationType.INFO,
      })
      return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
      setNotification({
        text: 'An error occurred, please try again later',
        type: ENotificationType.ERROR,
      })
      return false
    }
    return true
  }

  return {
    handleAdminRequest,
  }
}
