import * as stylex from '@stylexjs/stylex'
import { color, size } from '../../styles/variables.stylex'

export const s = stylex.create({
    sidebar: {
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '20px',
        height: '100vh',
        zIndex: 1,
    },
    isActive: {
        backgroundColor: color.black_1,
    },
    list: {
        listStyle: 'none',
        padding: 0,
    },
    menu: {
        fontSize: size.fontBig,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '290px',
    },
    link: {
        color: color.white,
        textDecoration: 'none',
    },
    activeLink: {
        color: color.darkGray,
    },
    hamburger: {
        height: size.hamburgerIconHeight,
        width: size.hamburgerIconWidth,
        cursor: 'pointer',
    },
    languageSelector: {
        position: 'absolute',
        bottom: '20px',
    },
})
