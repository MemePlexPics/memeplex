import { Input, Tabs } from '../../components'
import './style.css'
import { useState } from 'react'
import { useMeta, useTitle, useTranslatedState } from '../../hooks'
import { Channels, FeaturedChannels, SuggestedChannels } from '../../components/organisms'
import { useTranslation } from 'react-i18next'

export const AdminPage = () => {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [tabs] = useTranslatedState<string[]>(() => [t('tab.channels'), t('tab.suggested'), t('tab.featured')])
  const [currentTab, setCurrentTab] = useState<string>('')

  useTitle([currentTab, 'Admin'])

  useMeta([
      {
          name: 'robots',
          content: 'noindex',
      },
  ])

  return (
    <div className='admin-page'>
      <Input
          id="password"
          className="input"
          type="password"
          required
          placeholder={t('placeholder.password')}
          value={password}
          onInput={setPassword}
      />
      <Tabs
        tabs={tabs}
        onChange={tab => setCurrentTab(tab)}
      >
        <Channels key={t('tab.channels')} password={password} />
        <SuggestedChannels key={t('tab.suggested')} password={password} />
        <FeaturedChannels key={t('tab.featured')} password={password} />
      </Tabs>
    </div>
  )
}
