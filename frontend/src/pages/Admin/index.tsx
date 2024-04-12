import './style.css'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Tabs } from '@/components'
import { InputPassword } from '@/components/molecules'
import {
  BlaclListSettings,
  Channels,
  FeaturedChannels,
  SuggestedChannels,
} from '@/components/organisms'
import { useMeta, useTitle, useTranslatedState } from '@/hooks'
import { adminPasswordAtom } from '@/store/atoms'

export const AdminPage = () => {
  const { t } = useTranslation()
  const password = useAtomValue(adminPasswordAtom)
  const [tabs] = useTranslatedState<string[]>(() => [
    t('tab.channels'),
    t('tab.suggested'),
    t('tab.featured'),
    t('tab.blacklist'),
  ])
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
      <InputPassword />
      <Tabs
        tabs={tabs}
        onChange={tab => {
          setCurrentTab(tab)
        }}
      >
        <Channels
          key={t('tab.channels')}
          password={password}
        />
        <SuggestedChannels
          key={t('tab.suggested')}
          password={password}
        />
        <FeaturedChannels
          key={t('tab.featured')}
          password={password}
        />
        <BlaclListSettings
          key={t('tab.blacklist')}
          password={password}
        />
      </Tabs>
    </div>
  )
}
