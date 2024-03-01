import { Input, Tabs } from '../../components'
import './style.css'
import { useState } from 'react'
import { useMeta, useTitle } from '../../hooks'
import { Channels, FeaturedChannels, SuggestedChannels } from '../../components/organisms'

export const AdminPage = () => {
  const [password, setPassword] = useState('')
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
          placeholder="Password"
          value={password}
          onInput={setPassword}
      />
      <Tabs
        tabs={['Channels', 'Suggested', 'Featured']}
        onChange={tab => setCurrentTab(tab)}
      >
        <Channels key='Channels' password={password} />
        <SuggestedChannels key='Suggested'password={password} />
        <FeaturedChannels key='Featured'  password={password} />
      </Tabs>
    </div>
  )
}
