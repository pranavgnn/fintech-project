import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart4, Users, Gift } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    activeOffers: number;
  };
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.totalUsers
            )}
          </div>
          <p className="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.activeOffers
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently active offers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.totalAccounts
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Bank accounts across all users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
          <BarChart4 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.totalTransactions
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Processed transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
