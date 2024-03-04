import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export const useTranslatedState = <GState>(originalState: () => GState): [GState, Dispatch<SetStateAction<GState>>] => {
    const [state, setState] = useState<GState>(originalState())
    const { i18n } = useTranslation()

    useEffect(() => {
        setState(originalState())
    }, [i18n.language])

    return [state, setState]
}
