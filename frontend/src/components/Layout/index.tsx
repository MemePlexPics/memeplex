import { Outlet } from "react-router-dom"
import { Logo, ButtonScrollToTop, GitHubLink, SidebarMenu } from ".."

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
    </>
)
