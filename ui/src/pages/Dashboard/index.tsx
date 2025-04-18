import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CreditCard, Plus, TrendingUp } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { accountApi, offerApi } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";

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
}

interface Offer {
  id: number;
  description: string;
  type: string;
  validFrom: string;
  validTill: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        const accountsRes = await accountApi.getAccounts();
        setAccounts(accountsRes.data);

        // Fetch transactions for the first account if available
        if (accountsRes.data.length > 0) {
          const firstAccountId = accountsRes.data[0].id;
          const transactionsRes = await accountApi.getAccountTransactions(
            firstAccountId
          );
          setTransactions(transactionsRes.data);
        }

        // Fetch offers
        const offersRes = await offerApi.getOffers();
        setOffers(offersRes.data);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        // Error handling is now done in the API interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          to="/accounts/new"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          New Account
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
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
                    Total Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalBalance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Active Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accounts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
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
                    Active Offers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {offers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Recent Transactions
            </h2>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction) => (
                    <li key={transaction.id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {transaction.type}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
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
            <div className="mt-6">
              <Link
                to="/accounts"
                className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View all transactions
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Active Offers
            </h2>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {offers.length > 0 ? (
                  offers.map((offer) => (
                    <li key={offer.id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {offer.description}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            Valid till{" "}
                            {new Date(offer.validTill).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {offer.type}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-5 text-center text-sm text-gray-500">
                    No active offers
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
