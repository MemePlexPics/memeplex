import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import { App } from './App.tsx'

const root = document.getElementById('root')

ReactDOM
  .createRoot(root!)
  .render(
    <React.StrictMode>
      <Provider>
        <App />
      </Provider>
    </React.StrictMode>,
  )
