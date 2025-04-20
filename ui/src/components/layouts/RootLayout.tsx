import React from "react";
import { Toaster } from "sonner";
import MainNavbar from "../shared/Navbar";
import Footer from "../shared/Footer";

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
      <main className="flex-grow pt-16">{children}</main>
      {showFooter && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
};

export default RootLayout;
