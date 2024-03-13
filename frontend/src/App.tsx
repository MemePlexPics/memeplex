import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './style.css'

import { routes } from './constants'
import { loadLocalizationResources } from './i18n/utils'
import { languageAtom } from './store/atoms'
import { getTitleAtom } from './store/atoms/getters'

export const App = () => {
  const { i18n } = useTranslation()
  const title = useAtomValue(getTitleAtom)
  const router = createBrowserRouter(routes)
  const language = useAtomValue(languageAtom)

  const addLocalization = async (language: 'ru' | 'en') => {
    i18n.addResourceBundle(language, 'translation', await loadLocalizationResources(language), true)
    await i18n.changeLanguage(language)
  }

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    void addLocalization(language)
  }, [language])

  return (
    <RouterProvider router={router} />
  )
}
