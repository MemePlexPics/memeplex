import { useTranslation } from 'react-i18next'

import { ENotificationType } from '../components/Notification/constants'

import { useNotification } from '.'

export const useAdminRequest = () => {
  const { t } = useTranslation()
  const setNotification = useNotification()

  const handleAdminRequest = (response: Response) => {
    if (response.status === 403) {
      setNotification({
        text: t('notification.incorrectPassword'),
        type: ENotificationType.INFO,
      })
      return false
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500 || !response.ok) {
      setNotification({
        text: t('label.errorOccured'),
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
