import * as stylex from '@stylexjs/stylex'
import { color, size } from '../../styles/variables.stylex'

const topBorderRadius = '6px'

export const s = stylex.create({
    tabs: {
        display: 'flex',
        gap: '10px',
        paddingBottom: '14px',
    },
    tab: {
        color: color.white,
        fontSize: size.fontBig,
        border: '2px solid transparent',
        padding: '0 10px',
        cursor: 'pointer',
    },
    isActive: {
        borderColor: color.lightGray,
        borderBottomColor: 'transparent',
        borderTopLeftRadius: topBorderRadius,
        borderTopRightRadius: topBorderRadius,
    },
    tabContent: {
        display: 'none',
    },
    isActiveContent: {
        display: 'initial',
    },
})
