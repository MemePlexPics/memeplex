import { TTelegrafContext } from "./TTelegrafContext"

export type TMenuButton =
  string |
  [
    string,
    (ctx?: TTelegrafContext) => Promise<unknown> | unknown
  ]
