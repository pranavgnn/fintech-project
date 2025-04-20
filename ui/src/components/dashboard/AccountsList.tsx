import React from "react";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Format number using Indian numbering system
const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface AccountsListProps {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          You don't have any accounts yet.
        </p>
        <Button asChild className="mt-4">
          <Link to="/accounts/create">
            <Plus className="mr-2 h-4 w-4" /> Create Your First Account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Type</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">
                  {account.accountType}
                </TableCell>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{formatIndianCurrency(account.balance)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/accounts/${account.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link to="/accounts/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Account
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AccountsList;
