import stylex from '@stylexjs/stylex'

const MOBILE_PORTRAIT = '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const s = stylex.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '40px',
        gap: '4px',
        width: {
            default: '70vw',
            [MOBILE_PORTRAIT]: '100%',
        },
    },
})
