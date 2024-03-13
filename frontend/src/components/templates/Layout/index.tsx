import { Outlet } from 'react-router-dom'

import {
  Logo,
  ButtonScrollToTop,
  GitHubLink,
  DialogConfirmation,
  Notifications,
} from '@/components'

import './style.css'
import { SidebarMenu } from '@/components/organisms'

export const Layout = () => (
  <>
    <SidebarMenu />
    <div>
      <Logo />
      <main className='main'>
        <Outlet />
      </main>
    </div>

    <ButtonScrollToTop />
    <GitHubLink />
    <DialogConfirmation />
    <Notifications />
  </>
)
