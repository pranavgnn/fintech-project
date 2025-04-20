import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import AdminSidebar from "../admin/AdminSidebar";
import RootLayout from "./RootLayout";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, showFooter = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);

  const isAdmin = isAuthenticated && user?.roles?.includes("ROLE_ADMIN");

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <RootLayout showFooter={showFooter}>
      <div className="flex h-screen bg-muted/20">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 sm:max-w-sm">
            <AdminSidebar mobile onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </RootLayout>
  );
};

export default AdminLayout;
