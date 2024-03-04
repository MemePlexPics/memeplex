import { resources } from "../../i18n"
import type { TDeepTypeInObject, TI18nLocalization } from '..'

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: TI18nLocalization,
    },
  }
}
