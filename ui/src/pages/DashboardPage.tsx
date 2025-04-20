import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // Add this import
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, CreditCard, ArrowUpDown, Gift } from "lucide-react";
import AccountsList from "@/components/dashboard/AccountsList";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import OffersSection from "@/components/dashboard/OffersSection";
import { toast } from "sonner";

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

// Format number using Indian numbering system
const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Add this line
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offersCount, setOffersCount] = useState<number>(0);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        console.log("Fetching accounts for user:", user.id);
        const response = await fetch(`/api/users/${user.id}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Accounts fetched successfully:", data);
          setAccounts(data);
        } else {
          console.error(`Failed to fetch accounts. Status: ${response.status}`);
          if (response.status === 404) {
            // No accounts found
            setAccounts([]);
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setError("Could not load accounts. Please try again later.");
        toast.error("Failed to load account data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [user]);

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Set number of offers from the OffersSection component
  const handleOffersLoaded = (count: number) => {
    setOffersCount(count);
  };

  // Add this function to handle the quick transfer click
  const handleQuickTransferClick = () => {
    navigate("/transfer");
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatIndianCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Accounts
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          {/* Make the Quick Transfer card clickable */}
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={handleQuickTransferClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Transfer
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Transfer</div>
              <p className="text-xs text-muted-foreground">
                Between your accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Special Offers
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {offersCount} {offersCount === 1 ? "Offer" : "Offers"}
              </div>
              <p className="text-xs text-muted-foreground">
                Exclusive banking offers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Accounts List */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsList
                accounts={accounts}
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions userId={user?.id} accounts={accounts} />
            </CardContent>
          </Card>
        </div>

        {/* Offers Section */}
        <OffersSection onOffersLoaded={handleOffersLoaded} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
