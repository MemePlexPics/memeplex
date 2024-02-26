import classnames from 'classnames'

import './style.css'

export const HamburgerIcon = (props: {
    isActive?: boolean
    onClick?: () => void
}) => {
    return (
        <div className={classnames("hamburger", { isActive: props.isActive })} onClick={props.onClick}>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
        </div>
    )
}
