import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import { App } from './App.tsx'
import i18n from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { resources } from './i18n'

const root = document.getElementById('root')

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

ReactDOM
  .createRoot(root!)
  .render(
    <React.StrictMode>
      <Provider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>
    </React.StrictMode>,
  )
