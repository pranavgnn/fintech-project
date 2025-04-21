import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { formatIndianCurrency } from "@/utils/formatters";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { toast } from "sonner";

interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
}

const AccountDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!user || !accountId) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/api/users/${user.id}/accounts/${accountId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setAccount(data);
      } catch (err: any) {
        console.error("Error fetching account details:", err);
        setError("Failed to load account details");
        toast.error("Failed to load account details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [user, accountId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Account not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Account Details</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Account Number</p>
                <p className="text-sm">{account.accountNumber}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-sm">{account.type}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Balance</p>
                <p className="text-sm">
                  {formatIndianCurrency(account.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button
              variant="default"
              onClick={() => navigate(`/accounts/${accountId}/transactions`)}
              className="ml-auto"
            >
              View All Transactions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactions userId={user?.id} accounts={[account]} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetailsPage;
