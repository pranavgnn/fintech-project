import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import Sidebar from "@/components/shared/Sidebar";
import RootLayout from "./RootLayout";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gift,
  BarChart,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  showFooter = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && user?.roles?.includes("ROLE_ADMIN");

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  const navItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Accounts", href: "/admin/accounts", icon: CreditCard },
    { title: "Offers", href: "/admin/offers", icon: Gift },
    { title: "Transactions", href: "/admin/transactions", icon: BarChart },
  ];

  return (
    <RootLayout showFooter={showFooter}>
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar items={navItems} />
        <div className="pl-64 w-full">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RootLayout>
  );
};

export default AdminLayout;
