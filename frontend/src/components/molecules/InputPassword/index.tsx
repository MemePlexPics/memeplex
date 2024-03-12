import { useAtom } from "jotai"
import { Input } from "../.."
import { adminPasswordAtom } from "../../../store/atoms"
import { useTranslation } from "react-i18next"

export const InputPassword = () => {
    const { t } = useTranslation()
    const [password, setPassword] = useAtom(adminPasswordAtom)

    return (
        <Input
          id="password"
          className="input"
          type="password"
          required
          placeholder={t('placeholder.password')}
          value={password}
          onInput={setPassword}
      />
    )
}
