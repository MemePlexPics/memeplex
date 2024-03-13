import type { TI18nLocalization } from '..'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: TI18nLocalization
    }
  }
}
