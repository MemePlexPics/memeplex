import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo/logo_600.png'

export const Logo = () => (
    <Link to="/">
        <img id="logo" src={logo} />
    </Link>
)
