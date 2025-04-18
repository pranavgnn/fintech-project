import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import { userApi, offerApi } from "../../lib/api";
import { formatDateTime } from "../../lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

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
  users: User[];
}

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newOffer, setNewOffer] = useState({
    description: "",
    type: "",
    validFrom: "",
    validTill: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, offersRes] = await Promise.all([
          userApi.getUsers(),
          offerApi.getOffers(),
        ]);

        setUsers(usersRes.data);
        setOffers(offersRes.data);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await offerApi.createOffer(newOffer);
      toast.success("Offer created successfully");
      setNewOffer({
        description: "",
        type: "",
        validFrom: "",
        validTill: "",
      });

      const response = await offerApi.getOffers();
      setOffers(response.data);
    } catch (error: any) {
      console.error("Error creating offer:", error);
      toast.error(error.response?.data?.message || "Failed to create offer");
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    try {
      await offerApi.deleteOffer(offerId);
      toast.success("Offer deleted successfully");
      setOffers(offers.filter((offer) => offer.id !== offerId));
    } catch (error: any) {
      console.error("Error deleting offer:", error);
      toast.error(error.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleAssignOffer = async (offerId: number, userId: number) => {
    try {
      await offerApi.assignOffer(offerId, userId);
      toast.success("Offer assigned successfully");
      const response = await offerApi.getOffers();
      setOffers(response.data);
    } catch (error: any) {
      console.error("Error assigning offer:", error);
      toast.error(error.response?.data?.message || "Failed to assign offer");
    }
  };

  const handleRemoveOffer = async (offerId: number, userId: number) => {
    try {
      await offerApi.removeOffer(offerId, userId);
      toast.success("Offer removed successfully");
      const response = await offerApi.getOffers();
      setOffers(response.data);
    } catch (error: any) {
      console.error("Error removing offer:", error);
      toast.error(error.response?.data?.message || "Failed to remove offer");
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    try {
      // Get user's accounts
      const accountsRes = await userApi.getUserAccounts(user.id);
      setSelectedAccount(accountsRes.data[0] || null);

      // If there's an account, get its transactions
      if (accountsRes.data[0]) {
        const transactionsRes = await userApi.getUserTransactions(
          user.id,
          accountsRes.data[0].id
        );
        setTransactions(transactionsRes.data);
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch user details"
      );
    }
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create New Offer
            </h2>
            <form onSubmit={handleCreateOffer} className="mt-6 space-y-6">
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
                    value={newOffer.description}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, description: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Type
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="type"
                    id="type"
                    value={newOffer.type}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, type: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="validFrom"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Valid From
                </label>
                <div className="mt-2">
                  <input
                    type="datetime-local"
                    name="validFrom"
                    id="validFrom"
                    value={newOffer.validFrom}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, validFrom: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="validTill"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Valid Till
                </label>
                <div className="mt-2">
                  <input
                    type="datetime-local"
                    name="validTill"
                    id="validTill"
                    value={newOffer.validTill}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, validTill: e.target.value })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Active Offers
            </h2>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {offers.map((offer) => (
                  <li key={offer.id} className="py-5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {offer.description}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {formatDateTime(offer.validFrom)} -{" "}
                          {formatDateTime(offer.validTill)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Assigned to {offer.users.length} users
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Users
            </h2>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="py-5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="rounded-md bg-primary/10 p-2 text-primary hover:bg-primary/20"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                User Details: {selectedUser.name}
              </h2>
              {selectedAccount && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Account</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedAccount.accountType} -{" "}
                    {selectedAccount.accountNumber}
                  </p>
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Assign Offers
                </h3>
                <div className="mt-2 space-y-2">
                  {offers.map((offer) => {
                    const isAssigned = offer.users.some(
                      (u) => u.id === selectedUser.id
                    );
                    return (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-900">
                          {offer.description}
                        </span>
                        <button
                          onClick={() =>
                            isAssigned
                              ? handleRemoveOffer(offer.id, selectedUser.id)
                              : handleAssignOffer(offer.id, selectedUser.id)
                          }
                          className={`rounded-md p-2 ${
                            isAssigned
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {isAssigned ? (
                            <UserMinus className="h-5 w-5" />
                          ) : (
                            <UserPlus className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
