import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gift,
  BarChart,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobile = false,
  onClose,
}) => {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Accounts",
      href: "/admin/accounts",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Offers",
      href: "/admin/offers",
      icon: <Gift className="h-4 w-4" />,
    },
    {
      title: "Transactions",
      href: "/admin/transactions",
      icon: <BarChart className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full w-64 bg-card border-r border-border p-4",
        mobile && "pt-0"
      )}
    >
      {mobile && (
        <div className="flex items-center justify-between py-4">
          <Link to="/admin">
            <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {!mobile && (
        <Link to="/admin" className="flex items-center gap-2 mb-10 mt-4">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        </Link>
      )}

      <nav className="space-y-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              location.pathname === link.href ||
                (link.href !== "/admin" &&
                  location.pathname.startsWith(link.href))
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
            onClick={mobile && onClose ? onClose : undefined}
          >
            {link.icon}
            {link.title}
          </Link>
        ))}
      </nav>

      <Button
        variant="outline"
        className="mt-auto flex items-center gap-2"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default AdminSidebar;
