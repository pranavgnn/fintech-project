import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import DashboardStats from "@/components/admin/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import UserActivityChart from "@/components/admin/UserActivityChart";
import TransactionVolumeChart from "@/components/admin/TransactionVolumeChart";
import AccountTypeDistribution from "@/components/admin/AccountTypeDistribution";
import RecentUsersList from "@/components/admin/RecentUsersList";
import RecentTransactionsList from "@/components/admin/RecentTransactionsList";

interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  activeOffers: number;
  totalBalance: number;
  recentUsers: any[];
  recentTransactions: any[];
  transactionVolume: any[];
  accountsByType: any[];
  userGrowth: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    activeOffers: 0,
    totalBalance: 0,
    recentUsers: [],
    recentTransactions: [],
    transactionVolume: [],
    accountsByType: [],
    userGrowth: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch the summary statistics
      const statsResponse = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error(
          `Failed to fetch dashboard stats: ${statsResponse.status}`
        );
      }

      const statsData = await statsResponse.json();

      // Fetch recent users (for the table)
      const usersResponse = await fetch("/api/users?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let recentUsers = [];
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        recentUsers = usersData.slice(0, 5); // Get only last 5 users
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch(
        "/api/admin/transactions/recent",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let recentTransactions = [];
      if (transactionsResponse.ok) {
        recentTransactions = await transactionsResponse.json();
      }

      // Simulate fetching transaction volume data
      // In a real application, these would come from dedicated API endpoints
      const transactionVolume = generateTransactionVolumeData();
      const accountsByType = generateAccountTypeDistribution();
      const userGrowth = generateUserGrowthData();

      setStats({
        ...statsData,
        recentUsers,
        recentTransactions,
        transactionVolume,
        accountsByType,
        userGrowth,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard statistics");

      // Simulate data for development purposes
      simulateDashboardData();
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary data generation functions for development
  const generateTransactionVolumeData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
    ];
    return months.map((month) => ({
      month,
      incoming: Math.floor(Math.random() * 500000) + 100000,
      outgoing: Math.floor(Math.random() * 400000) + 80000,
    }));
  };

  const generateAccountTypeDistribution = () => {
    return [
      { type: "Savings", count: Math.floor(Math.random() * 100) + 50 },
      { type: "Checking", count: Math.floor(Math.random() * 80) + 30 },
      { type: "Fixed Deposit", count: Math.floor(Math.random() * 40) + 10 },
    ];
  };

  const generateUserGrowthData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
    ];
    let userCount = 10;

    return months.map((month) => {
      const growth = Math.floor(Math.random() * 20) + 5;
      userCount += growth;
      return { month, users: userCount };
    });
  };

  const simulateDashboardData = () => {
    setStats({
      totalUsers: 127,
      totalAccounts: 195,
      totalTransactions: 1423,
      activeOffers: 8,
      totalBalance: 15789034,
      recentUsers: Array(5)
        .fill({})
        .map((_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          roles: ["ROLE_USER"],
        })),
      recentTransactions: Array(5)
        .fill({})
        .map((_, i) => ({
          id: i + 1,
          fromAccountNumber: `ACCT${1000 + i}`,
          toAccountNumber: `ACCT${2000 + i}`,
          amount: Math.floor(Math.random() * 10000) + 1000,
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          status: ["COMPLETED", "PENDING", "COMPLETED", "COMPLETED", "FAILED"][
            i
          ],
        })),
      transactionVolume: generateTransactionVolumeData(),
      accountsByType: generateAccountTypeDistribution(),
      userGrowth: generateUserGrowthData(),
    });
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchDashboardStats()}>
              Refresh Data
            </Button>
            <Button onClick={() => navigate("/admin/reports")}>
              Full Reports
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats
          stats={{
            totalUsers: stats.totalUsers,
            totalAccounts: stats.totalAccounts,
            totalTransactions: stats.totalTransactions,
            activeOffers: stats.activeOffers,
            totalBalance: stats.totalBalance,
          }}
          isLoading={isLoading}
        />

        {/* Charts */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transaction Volume</TabsTrigger>
            <TabsTrigger value="accounts">Accounts Distribution</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>
                  Monthly transaction volume over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <TransactionVolumeChart
                  data={stats.transactionVolume}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Type Distribution</CardTitle>
                <CardDescription>
                  Distribution of accounts by type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <AccountTypeDistribution
                  data={stats.accountsByType}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  Monthly user registration growth
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <UserActivityChart
                  data={stats.userGrowth}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/users")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <RecentUsersList
                users={stats.recentUsers}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial transactions</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/transactions")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <RecentTransactionsList
                transactions={stats.recentTransactions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Real-time system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  API Response Time
                </p>
                <p className="font-medium text-2xl">124ms</p>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Database Load
                </p>
                <p className="font-medium text-2xl">42%</p>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Error Rate
                </p>
                <p className="font-medium text-2xl">0.2%</p>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "2%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Server Uptime
                </p>
                <p className="font-medium text-2xl">99.99%</p>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "99.9%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
