import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatIndianCurrency } from "@/utils/formatters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Transaction {
  id: number;
  fromAccountNumber: string | null;
  toAccountNumber: string | null;
  amount: number;
  timestamp: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string;
}

interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
}

const AccountTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [transactionType, setTransactionType] = useState<
    "all" | "incoming" | "outgoing"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    if (!user || !accountId) return;

    fetchAccountDetails();
    fetchTransactions();
  }, [user, accountId]);

  useEffect(() => {
    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          (tx.description && tx.description.toLowerCase().includes(query)) ||
          (tx.fromAccountNumber && tx.fromAccountNumber.includes(query)) ||
          (tx.toAccountNumber && tx.toAccountNumber.includes(query))
      );
    }

    if (transactionType === "incoming") {
      result = result.filter(
        (tx) => tx.toAccountNumber === account?.accountNumber
      );
    } else if (transactionType === "outgoing") {
      result = result.filter(
        (tx) => tx.fromAccountNumber === account?.accountNumber
      );
    }

    if (dateRange?.from) {
      result = result.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        return txDate >= dateRange.from!;
      });
    }
    if (dateRange?.to) {
      result = result.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        const endDate = new Date(dateRange.to!);
        endDate.setDate(endDate.getDate() + 1);
        return txDate < endDate;
      });
    }

    result.sort((a, b) => {
      if (sortField === "timestamp") {
        return sortDirection === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortField === "amount") {
        return sortDirection === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      return 0;
    });

    setFilteredTransactions(result);
  }, [
    transactions,
    searchQuery,
    sortField,
    sortDirection,
    transactionType,
    dateRange,
    account,
  ]);

  const fetchAccountDetails = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching account details:", error);
      toast.error("Failed to load account details");
      setError("Could not load account details");
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/users/${user.id}/accounts/${accountId}/transactions`,
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
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setError("Could not load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortField("timestamp");
    setSortDirection("desc");
    setTransactionType("all");
    setDateRange(undefined);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "PENDING":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Pending
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "PPp");
    } catch (e) {
      return "Invalid date";
    }
  };

  const exportTransactions = () => {
    const headers = ["Date", "Type", "Description", "Amount", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx) => {
        const type =
          tx.toAccountNumber === account?.accountNumber ? "Credit" : "Debit";
        const amount = formatIndianCurrency(tx.amount);
        return [
          formatDateTime(tx.timestamp),
          type,
          tx.description || "Transaction",
          amount,
          tx.status,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${account?.accountNumber}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Transactions exported successfully!");
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">
              Account Transactions
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportTransactions}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/transfer`)}
            >
              New Transfer
            </Button>
          </div>
        </div>

        {account && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Account Number</CardDescription>
                <CardTitle>{account.accountNumber}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Account Type</CardDescription>
                <CardTitle>{account.type}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Balance</CardDescription>
                <CardTitle>{formatIndianCurrency(account.balance)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all transactions for this account
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select
                  value={transactionType}
                  onValueChange={(value) =>
                    setTransactionType(value as "all" | "incoming" | "outgoing")
                  }
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Transactions</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 px-1 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Date Range</h3>
                        <DateRangePicker
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Transaction Type
                        </h3>
                        <Select
                          value={transactionType}
                          onValueChange={(value) =>
                            setTransactionType(
                              value as "all" | "incoming" | "outgoing"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Transactions
                            </SelectItem>
                            <SelectItem value="incoming">Incoming</SelectItem>
                            <SelectItem value="outgoing">Outgoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Sort By</h3>
                        <Select value={sortField} onValueChange={setSortField}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="timestamp">Date</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Sort Direction</h3>
                        <Select
                          value={sortDirection}
                          onValueChange={(value) =>
                            setSortDirection(value as "asc" | "desc")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="w-full mt-8"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTransactions}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  No transactions found{searchQuery && " matching your search"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:text-primary"
                          onClick={() => handleSortChange("timestamp")}
                        >
                          Date
                          {sortField === "timestamp" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="inline-block ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="inline-block ml-1 h-4 w-4" />
                            ))}
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>From / To</TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-primary"
                          onClick={() => handleSortChange("amount")}
                        >
                          Amount
                          {sortField === "amount" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="inline-block ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="inline-block ml-1 h-4 w-4" />
                            ))}
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTransactions.map((transaction) => {
                        const isCredit =
                          transaction.toAccountNumber ===
                          account?.accountNumber;

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatDateTime(transaction.timestamp)}
                            </TableCell>
                            <TableCell>
                              {transaction.description || "Transaction"}
                            </TableCell>
                            <TableCell>
                              {isCredit
                                ? transaction.fromAccountNumber
                                  ? `From: ${transaction.fromAccountNumber}`
                                  : "External Credit"
                                : transaction.toAccountNumber
                                ? `To: ${transaction.toAccountNumber}`
                                : "External Debit"}
                            </TableCell>
                            <TableCell
                              className={`font-medium whitespace-nowrap ${
                                isCredit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatIndianCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {getTransactionStatusBadge(transaction.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageToShow;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = currentPage - 2 + i;
                          }

                          if (pageToShow <= totalPages) {
                            return (
                              <PaginationItem key={pageToShow}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageToShow)}
                                  isActive={currentPage === pageToShow}
                                >
                                  {pageToShow}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }

                          return null;
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountTransactionsPage;
