import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Loader } from '..'
import { IMeme } from '../../types'

import './style.css'

export const MemeContainer = (props: { meme: IMeme }) => {
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIsLoading(!imgRef.current?.complete)
  }, [props.meme.fileName])

  return (
    <div className='meme-container'>
      <Loader state={isLoading} />
      <Link
        to={`/memes/${props.meme.id}`}
        className='meme-link'
      >
        <img
          ref={imgRef}
          className='result-image'
          src={'/' + props.meme.fileName}
          alt={props.meme.text.eng}
          onLoad={() => {
            setIsLoading(false)
          }}
        />
      </Link>
    </div>
  )
}
