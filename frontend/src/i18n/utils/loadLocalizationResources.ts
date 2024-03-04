import { rus } from '..'
import { TDeepTypeInObject } from '../../types'

export const loadLocalizationResources = async (language: string): Promise<TDeepTypeInObject<typeof rus, string>> => {
    switch (language) {
      case 'ru':
        return (await import('../rus')).rus
      default:
        return (await import('../eng')).eng
    }
}
