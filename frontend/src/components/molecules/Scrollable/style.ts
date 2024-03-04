import * as stylex from '@stylexjs/stylex'
import { color } from '../../../styles/variables.stylex'

export const s = stylex.create({
    scrollable: {
        overflow: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: `${color.darkGray} transparent`,
        ':hover': {
            overflow: 'scroll',
        },
        ':active': {
            overflow: 'scroll',
        },
        ':focus': {
            overflow: 'scroll',
        },
    },
    horizontal: {
        maskImage: '-webkit-linear-gradient(right, rgba(0,0,0,0), rgba(0,0,0,1) 20%)',
    },
    vertical: {},
})
