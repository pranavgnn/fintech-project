import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowUpDown } from "lucide-react";
import { formatIndianCurrency } from "@/utils/formatters";
import { useNavigate } from "react-router";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
}

interface AccountsTableProps {
  accounts: Account[];
  onViewTransactions: (accountId: number) => void;
}

const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  onViewTransactions,
}) => {
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return (
      <Card className="border p-6 text-center">
        <p className="text-muted-foreground">
          You don't have any accounts yet.
        </p>
        <Button onClick={() => navigate("/accounts/create")} className="mt-4">
          Create Your First Account
        </Button>
      </Card>
    );
  }

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-200"
          >
            Savings
          </Badge>
        );
      case "CHECKING":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-200"
          >
            Checking
          </Badge>
        );
      case "FIXED_DEPOSIT":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-600 border-purple-200"
          >
            Fixed Deposit
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">
                  {account.accountNumber}
                </TableCell>
                <TableCell>{getAccountTypeBadge(account.type)}</TableCell>
                <TableCell className="text-right">
                  {formatIndianCurrency(account.balance)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewTransactions(account.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/transfer")}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default AccountsTable;
