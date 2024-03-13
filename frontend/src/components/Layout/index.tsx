import { Outlet } from 'react-router-dom'
import {
  Logo,
  ButtonScrollToTop,
  GitHubLink,
  SidebarMenu,
  DialogConfirmation,
  Notifications,
} from '..'

import './style.css'

export const Layout = () => (
  <>
    <SidebarMenu />
    <Logo />
    <main>
      <Outlet />
    </main>

    <ButtonScrollToTop />
    <GitHubLink />
    <DialogConfirmation />
    <Notifications />
  </>
)
