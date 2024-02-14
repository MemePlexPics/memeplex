import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

import { Layout } from './components'
import './style.css'
import { Admin, Home, Meme } from "./pages"

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
