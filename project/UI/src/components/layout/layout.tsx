import { Outlet } from 'react-router'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function Layout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <Sidebar className="hidden border-r md:block" />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
