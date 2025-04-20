import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import RootLayout from "@/components/layouts/RootLayout";

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <RootLayout>
      <div className="flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="space-y-6 max-w-md">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/"}>
                {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default NotFoundPage;
