import i18n from 'i18next'
import { Provider } from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { I18nextProvider, initReactI18next } from 'react-i18next'

import { App } from './App.tsx'

import { loadLocalizationResources } from './i18n/utils'

const root = document.getElementById('root')
const langCode = localStorage.getItem('language') || 'ru'

const init = async () => {
  await i18n.use(initReactI18next).init({
    resources: {
      [langCode]: {
        translation: await loadLocalizationResources(langCode),
      },
    },
    lng: langCode,
    interpolation: {
      escapeValue: false,
    },
  })

  if (!root) return

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Provider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>
    </React.StrictMode>,
  )
}

await init()
