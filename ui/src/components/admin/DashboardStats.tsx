import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CreditCard,
  ArrowRightLeft,
  Gift,
  Banknote,
} from "lucide-react";

interface StatsProps {
  stats: {
    totalUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    activeOffers: number;
    totalBalance: number;
  };
  isLoading: boolean;
}

const DashboardStats: React.FC<StatsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (amount: number | null | undefined) => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    // Handle undefined, null, or NaN values
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }

    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-7 w-1/2 mb-3" />
              <Skeleton className="h-10 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: <Users className="h-5 w-5 text-blue-500" />,
      subtext: "Registered users",
    },
    {
      title: "Total Accounts",
      value: formatNumber(stats.totalAccounts),
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      subtext: "Active accounts",
    },
    {
      title: "Transactions",
      value: formatNumber(stats.totalTransactions),
      icon: <ArrowRightLeft className="h-5 w-5 text-purple-500" />,
      subtext: "Processed transactions",
    },
    {
      title: "Active Offers",
      value: formatNumber(stats.activeOffers),
      icon: <Gift className="h-5 w-5 text-amber-500" />,
      subtext: "Live promotions",
    },
    {
      title: "Total Balance",
      value: formatCurrency(stats?.totalBalance || 0),
      icon: <Banknote className="h-5 w-5 text-emerald-500" />,
      subtext: "Across all accounts",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statItems.map((item, i) => (
        <Card key={i}>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {item.title}
              </p>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.subtext}</p>
            </div>
            <div className="p-2 bg-background rounded-full">{item.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
