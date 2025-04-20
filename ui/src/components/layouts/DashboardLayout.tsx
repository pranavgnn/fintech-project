import React, { useState } from "react";
import { Toaster } from "sonner";
import Sidebar from "../dashboard/Sidebar";
import RootLayout from "./RootLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showFooter = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RootLayout showFooter={showFooter}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar for larger screens */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-background">
              <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        <Toaster position="top-right" />
      </div>
    </RootLayout>
  );
};

export default DashboardLayout;
