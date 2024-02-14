import { InputHTMLAttributes } from "react"

import './style.css'

type TDefaultInput = InputHTMLAttributes<HTMLInputElement>

export const Input = (props: Omit<TDefaultInput, 'onInput'> & {
    onInput?: (value: string) => void
}) => {
    const onInput = (e: React.FormEvent<HTMLInputElement>) =>
        props?.onInput?.((e.target as HTMLInputElement).value)

    return <input {...props} onInput={onInput} />
}
