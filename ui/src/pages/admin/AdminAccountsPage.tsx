import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
  userId: number;
  userName?: string;
  userEmail?: string;
}

const AdminAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAccounts(accounts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAccounts(
        accounts.filter(
          (account) =>
            account.accountNumber?.toLowerCase().includes(query) ||
            account.type?.toLowerCase().includes(query) ||
            account.userName?.toLowerCase().includes(query) ||
            account.userEmail?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, accounts]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // First, fetch all users
      const usersResponse = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status}`);
      }

      const users = await usersResponse.json();

      // For each user, fetch their accounts
      const allAccounts: Account[] = [];

      for (const user of users) {
        const accountsResponse = await fetch(`/api/users/${user.id}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (accountsResponse.ok) {
          const userAccounts = await accountsResponse.json();
          // Enhance account objects with user information
          const enhancedAccounts = userAccounts.map((account: any) => ({
            ...account,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
          }));
          allAccounts.push(...enhancedAccounts);
        }
      }

      setAccounts(allAccounts);
      setFilteredAccounts(allAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewUser = (userId: number) => {
    navigate(`/admin/users/${userId}`);
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Savings
          </Badge>
        );
      case "CHECKING":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Checking
          </Badge>
        );
      case "FIXED_DEPOSIT":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Fixed Deposit
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Accounts Management
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Accounts</CardTitle>
            <CardDescription>
              View and manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by account number, type, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="ml-2">
                <Button disabled>Export Accounts</Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {searchQuery
                            ? "No accounts found matching your search"
                            : "No accounts found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            {account.accountNumber}
                          </TableCell>
                          <TableCell>
                            {getAccountTypeBadge(account.type)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(account.balance)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {account.userName || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {account.userEmail || "No email"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUser(account.userId)}
                              title="View user details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAccountsPage;
