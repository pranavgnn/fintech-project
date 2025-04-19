import { Home, Package, Users, CreditCard } from "lucide-react"
import { NavLink } from "react-router"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <nav className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex h-10 items-center gap-2 px-2">
        <div className="font-semibold">Finnbank</div>
      </div>
      <div className="flex flex-col gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Home className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/offers"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Package className="h-4 w-4" />
          Offers
        </NavLink>
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Users className="h-4 w-4" />
          Customers
        </NavLink>
        <NavLink
          to="/accounts"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <CreditCard className="h-4 w-4" />
          Accounts
        </NavLink>
      </div>
    </nav>
  )
}
