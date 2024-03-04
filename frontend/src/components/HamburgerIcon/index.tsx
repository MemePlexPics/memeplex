import classnames from 'classnames'

import './style.css'

export const HamburgerIcon = (props: {
    isActive?: boolean
    className?: string
    onClick?: () => void
}) => {
    return (
        <div className={classnames("hamburger", { isActive: props.isActive }, props.className)} onClick={props.onClick}>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
        </div>
    )
}
