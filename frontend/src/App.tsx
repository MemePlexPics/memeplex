import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom"

import { Layout } from './components'
import {
  AdminPage,
  ChannelListPage,
  HomePage,
  MemePage
} from "./pages"
import './style.css'
import { useAtomValue } from "jotai"
import { titleAtom } from "./store/atoms"
import { useEffect } from "react"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'memes/:id',
        element: <MemePage />,
      },
      {
        path: 'channelList',
        element: <ChannelListPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export const App = () => {
  const title = useAtomValue(titleAtom)

  useEffect(() => {
    document.title = [...title, 'MemePlex'].join(' | ')
  }, [title])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
