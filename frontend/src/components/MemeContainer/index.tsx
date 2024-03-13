import { Link } from 'react-router-dom'
import { Loader } from '..'
import { IMeme } from '../../types'

import './style.css'
import { useState } from 'react'

export const MemeContainer = (props: { meme: IMeme }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <Loader state={isLoading} />
      <Link
        to={`/memes/${props.meme.id}`}
        className='meme-link'
      >
        <img
          className='result-image'
          src={props.meme.fileName}
          alt={props.meme.text?.eng}
          onLoad={() => setIsLoading(false)}
        />
      </Link>
    </>
  )
}
