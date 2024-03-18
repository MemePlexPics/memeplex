import stylex from '@stylexjs/stylex'
import { Outlet } from 'react-router-dom'

import { s } from './style'

import {
  Logo,
  ButtonScrollToTop,
  GitHubLink,
  DialogConfirmation,
  Notifications,
} from '@/components'

import { SidebarMenu } from '@/components/organisms'

export const Layout = () => (
  <>
    <SidebarMenu />
    <div
      id='site-content'
      {...stylex.props(s.content)}
    >
      <Logo />
      <main {...stylex.props(s.main)}>
        <Outlet />
      </main>
    </div>

    <ButtonScrollToTop />
    <GitHubLink />
    <DialogConfirmation />
    <Notifications />
  </>
)
