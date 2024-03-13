import { RouteObject } from 'react-router-dom'

import { AboutPage, AdminPage, ChannelListPage, HomePage, MemePage } from '../pages'

import { Layout } from '@/components/templates'

export const routes: RouteObject[] = [
  {
    path: '/',
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
]
