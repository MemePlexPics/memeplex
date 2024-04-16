import stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getTgChannelName } from '../../utils'

import { s } from './style'

import { Button, Checkbox, Input } from '@/components/atoms'
import { TNewChannel } from '@/types'

export const AddChannelForm = (props: {
  onAddChannel: (channel: TNewChannel) => Promise<boolean>
}) => {
  const { t } = useTranslation()
  const [channelValue, setChannelValue] = useState('')
  const [isWithText, setIsWithText] = useState(false)

  const onClickSubmit = async () => {
    const channel = getTgChannelName(channelValue)
    if (
      await props.onAddChannel({
        name: channel,
        langs: ['eng'],
        withText: isWithText,
      })
    ) {
      setChannelValue('')
      setIsWithText(false)
    }
  }

  return (
    <div {...stylex.props(s.addChannelForm)}>
      <div {...stylex.props(s.inputContainer)}>
        <Input
          type='text'
          required
          placeholder={t('placeholder.channel')}
          value={channelValue}
          onInput={setChannelValue}
          onPressEnter={onClickSubmit}
        />
        <Button
          type='submit'
          value={t('button.submit')}
          onClick={onClickSubmit}
        />
      </div>
      <Checkbox
        label='With text'
        checked={isWithText}
        onChange={setIsWithText}
      />
    </div>
  )
}
