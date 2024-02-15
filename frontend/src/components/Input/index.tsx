import { InputHTMLAttributes } from "react"

import './style.css'
import classNames from "classnames"

type TDefaultInput = InputHTMLAttributes<HTMLInputElement>

export const Input = (props: Omit<TDefaultInput, 'onInput'> & {
    onInput?: (value: string) => void
}) => {
    const onInput = (e: React.FormEvent<HTMLInputElement>) =>
        props?.onInput?.((e.target as HTMLInputElement).value)

    return <input {...props} className={classNames(props.className, 'input')} onInput={onInput} />
}
