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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

const AdminAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
            account.accountNumber.toLowerCase().includes(query) ||
            account.user.name.toLowerCase().includes(query) ||
            account.type.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, accounts]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Fetch users first, then extract accounts
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const users = await response.json();

      // Extract and flatten accounts from users
      const allAccounts = users.reduce((accounts: Account[], user: any) => {
        if (user.accounts && Array.isArray(user.accounts)) {
          const userAccounts = user.accounts.map((account: any) => ({
            ...account,
            user: {
              id: user.id,
              name: user.name,
            },
          }));
          return [...accounts, ...userAccounts];
        }
        return accounts;
      }, []);

      setAccounts(allAccounts);
      setFilteredAccounts(allAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
            <CardTitle>All Bank Accounts</CardTitle>
            <CardDescription>
              View all registered accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by account number, owner name, or account type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
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
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Created On</TableHead>
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
                          <TableCell>{account.user.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                account.type === "SAVINGS"
                                  ? "outline"
                                  : account.type === "CHECKING"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {account.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(account.balance)}
                          </TableCell>
                          <TableCell>
                            {new Date(account.createdAt).toLocaleDateString()}
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
