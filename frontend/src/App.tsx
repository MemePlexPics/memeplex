import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

import './style.css'
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { getTitleAtom } from "./store/atoms/getters"
import { routes } from "./constants"
import { languageAtom } from "./store/atoms"
import { useTranslation } from "react-i18next"
import { loadLocalizationResources } from "./i18n/utils"

export const App = () => {
  const { i18n } = useTranslation()
  const title = useAtomValue(getTitleAtom)
  const router = createBrowserRouter(routes)
  const language = useAtomValue(languageAtom)

  const addLocalization = async (language: 'ru' | 'en') => {
    i18n.addResourceBundle(language, 'translation', await loadLocalizationResources(language), true)
    i18n.changeLanguage(language)
  }

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    addLocalization(language)
  }, [language])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
