import {
  createBrowserRouter,
  // Navigate,
  RouterProvider,
} from "react-router-dom"

import { Layout } from './components'
import {
  AboutPage,
  AdminPage,
  ChannelListPage,
  HomePage,
  MemePage
} from "./pages"
import './style.css'
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { getTitleAtom } from "./store/atoms/getters"

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
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
    ],
  },
  // {
  //   path: '*',
  //   element: <Navigate to="/" replace />,
  // },
])

export const App = () => {
  const title = useAtomValue(getTitleAtom)

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
