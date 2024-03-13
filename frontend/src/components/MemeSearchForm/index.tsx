import stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { s } from './style'

import { Button, Input } from '@/components/atoms'

export const MemeSearchForm = (props: { query: string; onUpdate: (query: string) => void }) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState(props.query)

  const onClickSearch = () => { props.onUpdate(query); }

  const onChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => { setQuery(event.target.value); }

  return (
    <div {...stylex.props(s.container)}>
      <Input
        className='input'
        type='text'
        placeholder={t('placeholder.memeSearch')}
        value={query}
        onChange={onChangeQuery}
        onPressEnter={onClickSearch}
      />
      <Button
        value={t('button.search')}
        onClick={onClickSearch}
      />
    </div>
  )
}
