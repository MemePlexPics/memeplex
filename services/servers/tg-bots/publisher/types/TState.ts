import { CallbackButton, MakeOptions } from "telegram-keyboard"
import { TTelegrafContext } from "."

export type TState<GStateName> = {
    stateName: GStateName
    inlineMenu?: (ctx?: TTelegrafContext) => {
        text: string
        buttons: CallbackButton[] | CallbackButton[][]
        options?: MakeOptions
    }
    message?: (ctx?: TTelegrafContext) => string
    onCallback?: <GCallback = GStateName>(ctx: TTelegrafContext, callback: GCallback) => unknown
    onText?: (ctx?: TTelegrafContext, text?: string) => unknown
}
