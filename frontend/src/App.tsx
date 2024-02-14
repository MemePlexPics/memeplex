import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

import { Layout } from './components'
import { Admin, Home, Meme } from "./pages"
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
        path: 'admin',
        element: <Admin />,
      }
    ],
  },
])

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
