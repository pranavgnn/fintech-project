import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const AccountDetailPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Account Details</h2>
        </div>

        <div className="bg-muted/50 p-8 rounded-lg flex items-center justify-center">
          <h1 className="text-2xl text-muted-foreground">
            Account details page is under construction
          </h1>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetailPage;
