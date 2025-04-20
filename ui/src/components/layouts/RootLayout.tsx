import React from "react";
import { Toaster } from "sonner";
import MainNavbar from "../ui/MainNavbar";
import Footer from "../ui/Footer";

interface RootLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <MainNavbar />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
};

export default RootLayout;
