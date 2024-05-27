import { Route } from "@vishtar/telegram-test-api/lib/routes/route"
import { TelegramServerWrapper } from "../utils"

export type TExpressRoute = (app: Parameters<Route>[0], telegramServer: TelegramServerWrapper) => void
