import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

import './style.css'
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { getTitleAtom } from "./store/atoms/getters"
import { routes } from "./constants"

export const App = () => {
  const title = useAtomValue(getTitleAtom)
  const router = createBrowserRouter(routes)

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
