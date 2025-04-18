import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CreditCard, Plus } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { accountApi } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
}

export function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsRes = await accountApi.getAccounts();
        setAccounts(accountsRes.data);
      } catch (error: any) {
        console.error("Error fetching accounts:", error);
        // Error handling is now done in the API interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <Link
          to="/accounts/new"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          New Account
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Link
            key={account.id}
            to={`/accounts/${account.id}`}
            className="block overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md"
          >
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
          </Link>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No accounts
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new account.
          </p>
          <div className="mt-6">
            <Link
              to="/accounts/new"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
