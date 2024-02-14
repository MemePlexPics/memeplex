import { Outlet } from "react-router-dom"
import { Logo, ButtonScrollToTop, GitHubLink, SidebarMenu } from ".."

export const Layout = () => (
    <>
      <SidebarMenu />
      <Logo />
      <Outlet />

      <ButtonScrollToTop />
      <GitHubLink />
    </>
)
