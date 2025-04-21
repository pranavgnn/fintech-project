import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, ArrowUpDown, BarChart } from "lucide-react";
import AccountCard from "@/components/accounts/AccountCard";
import AccountsTable from "@/components/accounts/AccountsTable";
import { formatIndianCurrency } from "@/utils/formatters";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
}

const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<string>("cards");

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user.id}/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts. Please try again.");
      toast.error("Could not load your accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/accounts/create");
  };

  const handleTransfer = () => {
    navigate("/transfer");
  };

  const handleViewTransactions = (accountId: number) => {
    navigate(`/accounts/${accountId}/transactions`);
  };

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Accounts</h2>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTransfer} variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button onClick={handleCreateAccount}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Account
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </p>
                <p className="text-2xl font-bold">
                  {formatIndianCurrency(totalBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  View Analytics
                </p>
                <Button
                  variant="link"
                  className="p-0 h-8"
                  onClick={() => navigate("/analytics")}
                >
                  <BarChart className="h-4 w-4 mr-1" />
                  View Financial Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Options */}
        <Tabs value={view} onValueChange={setView}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="cards">Cards View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cards" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-48 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-full bg-muted/20 rounded-lg"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="bg-destructive/10">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button
                    onClick={fetchAccounts}
                    variant="outline"
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    You don't have any accounts yet.
                  </p>
                  <Button onClick={handleCreateAccount} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onViewTransactions={() =>
                      handleViewTransactions(account.id)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 min-h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-destructive/10">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button
                    onClick={fetchAccounts}
                    variant="outline"
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AccountsTable
                accounts={accounts}
                onViewTransactions={handleViewTransactions}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AccountsPage;
