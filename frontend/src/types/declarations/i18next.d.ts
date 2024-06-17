import type { TI18nLocalization } from '..'

declare module 'i18next' {
  type CustomTypeOptions = {
    resources: {
      translation: TI18nLocalization
    }
  }
}
