import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom"

import { Layout } from './components'
import { Admin, ChannelList, Home, Meme } from "./pages"
import './style.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'memes/:id',
        element: <Meme />,
      },
      {
        path: 'channelList',
        element: <ChannelList />,
      },
      {
        path: 'admin',
        element: <Admin />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
