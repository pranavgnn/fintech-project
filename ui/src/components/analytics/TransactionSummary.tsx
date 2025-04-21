import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

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

interface TransactionSummaryProps {
  transactions: Transaction[];
  accounts: Account[];
  isLoading: boolean;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  transactions,
  accounts,
  isLoading,
}) => {
  const stats = useMemo(() => {
    if (!transactions.length || !accounts.length) {
      return {
        totalIncoming: 0,
        totalOutgoing: 0,
        avgTransactionAmount: 0,
        largestTransaction: 0,
        transactionCount: 0,
        mostActiveAccount: { accountNumber: "", count: 0 },
      };
    }

    let totalIncoming = 0;
    let totalOutgoing = 0;
    const accountActivity: { [key: string]: number } = {};
    let largestTransaction = 0;

    // Create set of account numbers for faster lookups
    const accountNumbers = new Set(accounts.map((a) => a.accountNumber));

    // Process transactions properly tracking both incoming and outgoing for internal transfers
    transactions.forEach((tx) => {
      // Check if this is an outgoing transaction
      if (tx.fromAccountNumber && accountNumbers.has(tx.fromAccountNumber)) {
        totalOutgoing += tx.amount;
        accountActivity[tx.fromAccountNumber] =
          (accountActivity[tx.fromAccountNumber] || 0) + 1;
      }

      // Check if this is an incoming transaction
      if (tx.toAccountNumber && accountNumbers.has(tx.toAccountNumber)) {
        totalIncoming += tx.amount;
        accountActivity[tx.toAccountNumber] =
          (accountActivity[tx.toAccountNumber] || 0) + 1;
      }

      // Track largest transaction
      if (tx.amount > largestTransaction) {
        largestTransaction = tx.amount;
      }
    });

    // Find most active account
    let mostActiveAccount = { accountNumber: "", count: 0 };
    Object.entries(accountActivity).forEach(([accountNumber, count]) => {
      if (count > mostActiveAccount.count) {
        mostActiveAccount = { accountNumber, count };
      }
    });

    return {
      totalIncoming,
      totalOutgoing,
      avgTransactionAmount:
        (totalIncoming + totalOutgoing) / (transactions.length || 1),
      largestTransaction,
      transactionCount: transactions.length,
      mostActiveAccount,
    };
  }, [transactions, accounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getMostActiveAccountDetails = () => {
    if (!stats.mostActiveAccount.accountNumber) return "No activity";
    const account = accounts.find(
      (a) => a.accountNumber === stats.mostActiveAccount.accountNumber
    );
    if (!account) return stats.mostActiveAccount.accountNumber;
    return `${account.type} (${account.accountNumber.slice(-4)})`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Money In
            <Badge className="ml-2 bg-green-500">
              <ArrowDownIcon className="h-3 w-3 mr-1" />
              Inflow
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalIncoming)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total incoming transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Money Out
            <Badge variant="outline" className="ml-2">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              Outflow
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalOutgoing)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total outgoing transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Transaction Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.transactionCount}</div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatCurrency(stats.avgTransactionAmount)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Most Active Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getMostActiveAccountDetails()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.mostActiveAccount.count} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummary;
