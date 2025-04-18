import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { accountApi } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/utils";

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description?: string;
}

export function AccountDetails() {
  const { accountId } = useParams();
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState<"CREDIT" | "DEBIT">(
    "CREDIT"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accountId) return;

        // Get account and transactions
        const [accountRes, transactionsRes] = await Promise.all([
          accountApi.getAccountById(Number(accountId)),
          accountApi.getAccountTransactions(Number(accountId)),
        ]);

        setAccount(accountRes.data);
        setTransactions(transactionsRes.data);
      } catch (error: any) {
        console.error("Error fetching account details:", error);
        // Error handling is now done in the API interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!accountId) return;

      // Create transaction
      await accountApi.createAccountTransaction(Number(accountId), {
        type: transactionType,
        amount: Number(amount),
        description,
      });

      // Refresh data
      const [accountRes, transactionsRes] = await Promise.all([
        accountApi.getAccountById(Number(accountId)),
        accountApi.getAccountTransactions(Number(accountId)),
      ]);

      setAccount(accountRes.data);
      setTransactions(transactionsRes.data);
      setAmount("");
      setDescription("");
      toast.success("Transaction processed successfully");
    } catch (error: any) {
      console.error("Error processing transaction:", error);
      // Error handling is now done in the API interceptor
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Account not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The account you're looking for doesn't exist or you don't have access
          to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard
                className="h-6 w-6 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">
                  {account.accountType}
                </dt>
                <dd className="mt-1 text-lg font-medium text-gray-900">
                  {formatCurrency(account.balance)}
                </dd>
                <dd className="mt-1 text-sm text-gray-500">
                  Account: {account.accountNumber}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            New Transaction
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Transaction Type
              </label>
              <div className="mt-2">
                <select
                  id="type"
                  name="type"
                  value={transactionType}
                  onChange={(e) =>
                    setTransactionType(e.target.value as "CREDIT" | "DEBIT")
                  }
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="CREDIT">Credit</option>
                  <option value="DEBIT">Debit</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Amount
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Transaction description"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Process Transaction
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Transaction History
          </h2>
          <div className="mt-6 flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <li key={transaction.id} className="py-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {transaction.type === "CREDIT" ? (
                          <ArrowDownLeft className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.type === "CREDIT"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-5 text-center text-sm text-gray-500">
                  No transactions found
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
