import React, { useState } from "react";
import { Toaster } from "sonner";
import Sidebar from "../shared/Sidebar";
import RootLayout from "./RootLayout";
import {
  BarChart,
  CreditCard,
  PlusCircle,
  Users,
  Home,
  ArrowRightLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showFooter = false,
}) => {
  const { user } = useAuth();

  const isAdmin = user?.roles?.some((role: string) => role === "ROLE_ADMIN");

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
    },
    {
      title: "Accounts",
      href: "/accounts",
      icon: CreditCard,
    },
    {
      title: "Transfer",
      href: "/transfer",
      icon: ArrowRightLeft,
    },
    {
      title: "Create Account",
      href: "/accounts/create",
      icon: PlusCircle,
    },
  ];

  if (isAdmin) {
    navItems.push({
      title: "Admin",
      href: "/admin",
      icon: Users,
    });
  }

  return (
    <RootLayout showFooter={showFooter}>
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={navItems} />
        <div className="pl-64 w-full">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RootLayout>
  );
};

export default DashboardLayout;
