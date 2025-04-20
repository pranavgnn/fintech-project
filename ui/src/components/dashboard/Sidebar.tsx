import React from "react";
import { Link, useLocation } from "react-router";
import {
  BarChart,
  CreditCard,
  PlusCircle,
  Users,
  Settings,
  X as CloseIcon,
  Home,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.roles?.some((role: string) => role === "ROLE_ADMIN");

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      active: location.pathname === "/dashboard",
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
      active: location.pathname === "/analytics",
    },
    {
      title: "Accounts",
      href: "/accounts",
      icon: CreditCard,
      active: location.pathname === "/accounts",
    },
    {
      title: "Transfer",
      href: "/transfer",
      icon: ArrowRightLeft,
      active: location.pathname === "/transfer",
    },
    {
      title: "Create Account",
      href: "/accounts/create",
      icon: PlusCircle,
      active: location.pathname === "/accounts/create",
    },
  ];

  if (isAdmin) {
    navItems.push({
      title: "Admin",
      href: "/admin",
      icon: Users,
      active: location.pathname.startsWith("/admin"),
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full w-64 bg-card border-r border-border p-4",
        mobile && "pt-0"
      )}
    >
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={mobile ? onClose : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              item.active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>

      <Link
        to="/settings"
        onClick={mobile ? onClose : undefined}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent mt-auto mb-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </div>
  );
};

export default Sidebar;
