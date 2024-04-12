import stylex from '@stylexjs/stylex'
import { DetailedHTMLProps, TextareaHTMLAttributes } from "react"

import { s } from './style'

export const Textarea = (props: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>) => {
    return <textarea {...stylex.props(s.textarea)} {...props} />
}
