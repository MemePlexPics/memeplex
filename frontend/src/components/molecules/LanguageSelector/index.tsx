import { useAtom } from 'jotai'

import { languageAtom } from '../../../store/atoms'
import { Select } from '../../atoms'

export const LanguageSelector = (props: {
  languageOpetions: { [langCode: string]: string }
  className?: string
}) => {
  const [language, setLanguage] = useAtom(languageAtom)

  const onSelect = (value: string) => {
    setLanguage(value as 'ru' | 'en')
  }

  return (
    <div className={props.className}>
      <Select
        options={props.languageOpetions}
        defaultValue={language}
        placeholder='Choose language'
        onSelect={onSelect}
      />
    </div>
  )
}
