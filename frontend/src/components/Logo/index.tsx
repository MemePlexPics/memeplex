import { useLocation, Link } from 'react-router-dom'
import logo from '../../assets/images/logo/logo_600.png'

export const Logo = () => {
    const location = useLocation()

    const onClick = () => {
        if (location.pathname === '/') window.location.reload()
    }

    return (
        <Link to="/" onClick={onClick}>
            <img id="logo" src={logo} alt='MemePlex' />
        </Link>
    )
}
