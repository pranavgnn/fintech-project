import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Improved date formatter with error handling
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date encountered:", dateString);
      return "N/A";
    }

    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "N/A";
  }
};

// Format number using Indian numbering system
const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface Transaction {
  id: number;
  accountId?: number;
  type?: string;
  amount: number;
  description: string;
  createdAt?: string;
  timestamp?: string; // Added to support both field names
  fromAccountNumber?: string;
  toAccountNumber?: string;
  accountNumber?: string;
  status?: string;
}

interface Account {
  id: number;
  accountNumber: string;
  accountType?: string;
  type?: string; // Added to support both field names
  balance?: number;
  currency?: string;
}

interface RecentTransactionsProps {
  userId?: number;
  accounts?: Account[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  userId,
  accounts = [],
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && accounts.length > 0) {
      fetchTransactions();
    } else {
      setIsLoading(false);
    }
  }, [userId, accounts]);

  const fetchTransactions = async () => {
    if (!userId || accounts.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      console.log("Fetching transactions for user:", userId);

      // Try fetching all user transactions first (new API endpoint)
      try {
        const response = await fetch(`/api/users/${userId}/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("All user transactions:", data);

          // Ensure data is properly structured
          const validData = Array.isArray(data) ? data : [];
          setTransactions(validData);
          setIsLoading(false);
          return;
        } else {
          console.warn("Could not fetch all transactions:", response.status);
        }
      } catch (e) {
        console.warn("All transactions API failed:", e);
      }

      // Fall back to fetching transactions for each account individually
      console.log("Falling back to per-account transactions");
      const transactionsPromises = accounts.map(async (account) => {
        try {
          const response = await fetch(
            `/api/users/${userId}/accounts/${account.id}/transactions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            console.warn(
              `Failed to fetch transactions for account ${account.id}. Status: ${response.status}`
            );
            return [];
          }

          const transactions = await response.json();
          return Array.isArray(transactions)
            ? transactions.map((transaction: any) => ({
                ...transaction,
                accountNumber: account.accountNumber || account.id.toString(),
              }))
            : [];
        } catch (error) {
          console.warn(
            `Error fetching transactions for account ${account.id}:`,
            error
          );
          return [];
        }
      });

      const results = await Promise.all(transactionsPromises);

      // Flatten and sort by date (supporting both createdAt and timestamp fields)
      const allTransactions = results
        .flat()
        .filter(
          (t) =>
            t && (typeof t.amount === "number" || typeof t.amount === "string")
        ) // Ensure valid transactions
        .sort((a, b) => {
          const dateA = a.timestamp
            ? new Date(a.timestamp).getTime()
            : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
          const dateB = b.timestamp
            ? new Date(b.timestamp).getTime()
            : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
          return dateB - dateA; // Most recent first
        })
        .slice(0, 5); // Only show 5 most recent

      console.log("Processed transactions:", allTransactions);
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Could not load recent transactions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div>
                <Skeleton className="h-4 w-[120px] mb-1" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchTransactions}>
          Try Again
        </Button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No accounts to display transactions for
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No transactions found for your accounts
      </div>
    );
  }

  // Determine transaction type for display
  const getTransactionType = (
    transaction: Transaction,
    accountsList: Account[]
  ): string => {
    // If transaction already has a type, use it
    if (transaction.type) return transaction.type;

    // Otherwise determine from account numbers
    const isOutgoing = accountsList.some(
      (acc) => acc.accountNumber === transaction.fromAccountNumber
    );

    return isOutgoing ? "DEBIT" : "CREDIT";
  };

  // Get account number to display
  const getDisplayAccountNumber = (transaction: Transaction): string => {
    if (transaction.accountNumber) {
      return transaction.accountNumber;
    }

    // For outgoing transactions, show the destination account
    if (
      accounts.some(
        (acc) => acc.accountNumber === transaction.fromAccountNumber
      )
    ) {
      return transaction.toAccountNumber || "N/A";
    }

    // For incoming transactions, show the source account
    return transaction.fromAccountNumber || "N/A";
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const transactionType = getTransactionType(transaction, accounts);
        const dateValue =
          transaction.timestamp || transaction.createdAt || null;
        const displayAccountNumber = getDisplayAccountNumber(transaction);

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between pb-3 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full",
                  transactionType === "DEBIT"
                    ? "bg-destructive/10"
                    : "bg-green-100"
                )}
              >
                {transactionType === "DEBIT" ? (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {transaction.description ||
                    (transactionType === "DEBIT" ? "Sent" : "Received")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayAccountNumber} • {formatDate(dateValue)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "font-medium",
                transactionType === "DEBIT"
                  ? "text-destructive"
                  : "text-green-600"
              )}
            >
              {transactionType === "DEBIT" ? "-" : "+"}
              {formatIndianCurrency(transaction.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RecentTransactions;
