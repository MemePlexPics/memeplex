import { CallbackButton, MakeOptions } from "telegram-keyboard"

export type TInlineMenu = {
    text: string
    buttons: CallbackButton[] | CallbackButton[][]
    options?: MakeOptions
}
