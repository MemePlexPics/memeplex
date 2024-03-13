import { useState } from 'react'
import { Button, Input } from '..'
import { getTgChannelName } from '../../utils'

import './style.css'
import { IFeaturedChannel } from '../../types'
import { useTranslation } from 'react-i18next'

export const AddFeaturedChannelForm = (props: {
  onAddChannel: (channel: IFeaturedChannel) => Promise<boolean>
}) => {
  const { t } = useTranslation()
  // TODO: <Form model={} />
  const [channelValue, setChannelValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [commentValue, setCommentValue] = useState('')

  const onClickSubmit = async () => {
    const channel = getTgChannelName(channelValue)
    if (
      await props.onAddChannel({
        username: channel,
        title: titleValue,
        comment: commentValue,
        timestamp: Date.now() / 1000,
      })
    ) {
      setChannelValue('')
      setTitleValue('')
      setCommentValue('')
    }
  }

  return (
    <div className='add-featured-channel-form'>
      <div id='form-container'>
        <label
          className='label'
          htmlFor='channel'
        >
          {t('label.channel')}:
        </label>
        <div className='input-container'>
          <Input
            id='channel'
            className='input'
            type='text'
            required
            placeholder={t('placeholder.channel')}
            value={channelValue}
            onInput={setChannelValue}
            onPressEnter={onClickSubmit}
          />
        </div>
        <label
          className='label'
          htmlFor='title'
        >
          {t('label.title')}:
        </label>
        <div className='input-container'>
          <Input
            id='title'
            className='input'
            type='text'
            required
            placeholder={t('placeholder.readableTitle')}
            value={titleValue}
            onInput={setTitleValue}
            onPressEnter={onClickSubmit}
          />
        </div>
        <label
          className='label'
          htmlFor='comment'
        >
          {t('label.comment')}:
        </label>
        <div className='input-container'>
          <Input
            id='channel'
            className='input'
            type='text'
            placeholder={t('placeholder.additionalInformation')}
            value={commentValue}
            onInput={setCommentValue}
            onPressEnter={onClickSubmit}
          />
        </div>
        <Button
          type='submit'
          value={t('button.submit')}
          onClick={onClickSubmit}
        />
      </div>
    </div>
  )
}
