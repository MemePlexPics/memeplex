import { useState } from 'react'

import { Button, Checkbox, Input } from '../../components'
import './style.css'
import { getTgChannelName, getUrl } from '../../utils'

export const Admin = () => {
  const [newChannelModel, setNewChannelModel] = useState({
    name: '',
    rus: false,
    eng: false,
    password: '',
  })

  const onClickSubmit = async () => {
    const channel = getTgChannelName(newChannelModel.name)
    const password = newChannelModel.password
    if (!channel || !password)
        return
    const response = await fetch(getUrl('/addChannel'), {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        // @ts-ignore // TODO: types
        langs: ['rus', 'eng'].filter(lang => newChannelModel[lang]),
        password,
      })
    })
    if (response.status === 403) {
      setNewChannelModel({ ...newChannelModel, password: '' });
      return
    }
    localStorage.setItem('isAdmin', '1')
    if (response.status === 500) {
        const error = await response.json()
        console.error(error)
        return
    }
    setNewChannelModel({ ...newChannelModel, name: '', rus: false, eng: false })
  }

  return (
    <div id="form-container">
      <form id="channel-inputs" className="channel-inputs">
        <label className="label" htmlFor="channel">Channel:</label>
        <Input
          id="channel"
          className="input"
          type="text"
          required
          placeholder="@name or https://t.me/name"
          value={newChannelModel.name}
          onInput={(value) => setNewChannelModel(
            {
              ...newChannelModel,
              name: value,
            }
          )}
        />
        <label className="label" htmlFor="languages">Languages:</label>
        <div id="languages">
          <Checkbox
            id="lang-eng"
            className="checkbox"
            type="checkbox"
            checked={newChannelModel.eng}
            onChange={(state) =>
              setNewChannelModel(
                {
                  ...newChannelModel,
                  eng: state,
                }
              )
            }
          />
          <label className="label" htmlFor="lang-eng">English</label>
          <Checkbox
            id="lang-rus"
            className="checkbox"
            type="checkbox"
            checked={newChannelModel.rus}
            onChange={(state) =>
              setNewChannelModel(
                {
                  ...newChannelModel,
                  rus: state,
                }
              )
            }
          />
          <label className="label" htmlFor="lang-rus">Russian</label>
        </div>
      </form>
      <Input
        id="password"
        className="input"
        type="password"
        required
        placeholder="Password"
        value={newChannelModel.password}
        onInput={(value) => setNewChannelModel(
          {
            ...newChannelModel,
            password: value,
          }
        )}
      />
      <Button
        type="submit"
        value="Submit"
        onClick={onClickSubmit}
      />
    </div>
  )
}
