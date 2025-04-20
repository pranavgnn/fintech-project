import React from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
}

interface SidebarProps {
  items: NavItem[];
}

const Sidebar = ({ items }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-card border-r border-border p-4">
      <nav className="space-y-2">
        {items?.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              item.href === location.pathname
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {item.icon ? (
              <item.icon className="h-4 w-4" />
            ) : (
              <span className="h-4 w-4" />
            )}
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
