import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart } from "lucide-react";
import TransactionChart from "@/components/analytics/TransactionChart";
import SpendingCategoryChart from "@/components/analytics/SpendingCategoryChart";
import BalanceHistoryChart from "@/components/analytics/BalanceHistoryChart";
import TransactionSummary from "@/components/analytics/TransactionSummary";

interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  timestamp: string;
  status: string;
  description: string;
}

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
}

const UserAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("transactions");

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch transactions
      const transactionsResponse = await fetch(
        `/api/users/${user?.id}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch accounts
      const accountsResponse = await fetch(`/api/users/${user?.id}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!transactionsResponse.ok || !accountsResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const transactionsData = await transactionsResponse.json();
      const accountsData = await accountsResponse.json();

      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="transactions">
              <BarChart className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="spending">
              <PieChart className="h-4 w-4 mr-2" />
              Spending Categories
            </TabsTrigger>
            <TabsTrigger value="balance">
              <LineChart className="h-4 w-4 mr-2" />
              Balance History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Patterns</CardTitle>
                <CardDescription>
                  Your transaction activity over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <TransactionChart
                  transactions={transactions}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <TransactionSummary
              transactions={transactions}
              accounts={accounts}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="spending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  How your spending is distributed by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <SpendingCategoryChart
                  transactions={transactions}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance History</CardTitle>
                <CardDescription>
                  Your account balance trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <BalanceHistoryChart
                  accounts={accounts}
                  transactions={transactions}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserAnalyticsPage;
