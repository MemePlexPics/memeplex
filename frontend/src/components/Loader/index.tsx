import classNames from 'classnames'
import './style.css'

export const Loader = (props: { state?: boolean; overPage?: boolean }) => {
  if (props.state === false) return null
  return (
    <div className={classNames('loader-container', { isOverPage: props.overPage })}>
      <div className='loader'></div>
    </div>
  )
}
