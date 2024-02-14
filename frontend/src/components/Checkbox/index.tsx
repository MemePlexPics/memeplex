import { InputHTMLAttributes } from "react"

import './style.css'

type TDefaultInput = InputHTMLAttributes<HTMLInputElement>

export const Checkbox = (props: Omit<TDefaultInput, 'onChange'> & {
    onChange?: (state: boolean) => void
}) => {
    const onChange = (e: React.FormEvent<HTMLInputElement>) =>
        props?.onChange?.((e.target as HTMLInputElement).checked)

    return <input {...props} type='checkbox' onChange={onChange} />
}
