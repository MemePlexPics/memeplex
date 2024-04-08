import { MakeOptions } from 'telegram-keyboard'
import { TMenuButton } from '.'

export type TMenu = {
  text: string
  buttons: TMenuButton[][]
  options?: MakeOptions
}
