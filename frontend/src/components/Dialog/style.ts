import * as stylex from '@stylexjs/stylex'
import { color, size } from '../../styles/variables.stylex'

export const s = stylex.create({
    dialog: {
        backgroundColor: color.lightGray,
        '::backdrop': {
            background: '#0000007d',
        },
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'end',
        gap: '4px',
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        color: color.black_2,
        fontSize: size.fontNormal,
        margin: 0,
    },
})
