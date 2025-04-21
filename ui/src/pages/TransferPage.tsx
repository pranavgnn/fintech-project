import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { formatIndianCurrency } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
}

// Schema for external transfer
const externalTransferSchema = z.object({
  fromAccountId: z.string({
    required_error: "Please select a source account",
  }),
  toAccountNumber: z
    .string()
    .min(1, "Please enter the destination account number"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be positive" }
    ),
  description: z.string().optional(),
});

// Schema for internal transfer between own accounts
const internalTransferSchema = z.object({
  fromAccountId: z.string({
    required_error: "Please select a source account",
  }),
  toAccountId: z
    .string({
      required_error: "Please select a destination account",
    })
    .refine((val) => val !== undefined, {
      message: "Please select a destination account",
    }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be positive" }
    ),
  description: z.string().optional(),
});

type ExternalTransferFormValues = z.infer<typeof externalTransferSchema>;
type InternalTransferFormValues = z.infer<typeof internalTransferSchema>;

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("external");

  // Form for external transfers
  const externalForm = useForm<ExternalTransferFormValues>({
    resolver: zodResolver(externalTransferSchema),
    defaultValues: {
      description: "",
    },
  });

  // Form for internal transfers
  const internalForm = useForm<InternalTransferFormValues>({
    resolver: zodResolver(internalTransferSchema),
    defaultValues: {
      description: "Transfer between own accounts",
    },
  });

  // Fetch user accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/users/${user.id}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setAccounts(data);
      } catch (err: any) {
        console.error("Error fetching accounts:", err);
        toast.error("Failed to load accounts");
      }
    };

    fetchAccounts();
  }, [user]);

  // Handle external transfer submission
  const onExternalSubmit = async (data: ExternalTransferFormValues) => {
    if (!user) {
      toast.error("You must be logged in to make transfers");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transferData = {
        fromAccountId: parseInt(data.fromAccountId),
        toAccountNumber: data.toAccountNumber,
        amount: parseFloat(data.amount),
        description: data.description || "External transfer",
      };

      console.log("Making transfer with data:", transferData);

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user.id}/transfers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to process transfer";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Transfer completed successfully!");
      externalForm.reset();
    } catch (err: any) {
      console.error("Error making transfer:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle internal transfer submission
  const onInternalSubmit = async (data: InternalTransferFormValues) => {
    if (!user) {
      toast.error("You must be logged in to make transfers");
      return;
    }

    if (data.fromAccountId === data.toAccountId) {
      toast.error("Source and destination accounts cannot be the same");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find destination account number from ID
      const destinationAccount = accounts.find(
        (acc) => acc.id === parseInt(data.toAccountId)
      );

      if (!destinationAccount) {
        throw new Error("Destination account not found");
      }

      const transferData = {
        fromAccountId: parseInt(data.fromAccountId),
        toAccountNumber: destinationAccount.accountNumber,
        amount: parseFloat(data.amount),
        description: data.description || "Transfer between own accounts",
      };

      console.log("Making internal transfer with data:", transferData);

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user.id}/transfers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to process transfer";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Transfer between accounts completed successfully!");
      internalForm.reset();
    } catch (err: any) {
      console.error("Error making transfer:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Transfer Funds</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Money Transfer</CardTitle>
            <CardDescription>
              Transfer money between your accounts or to other accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="external">External Transfer</TabsTrigger>
                <TabsTrigger value="internal">Between My Accounts</TabsTrigger>
              </TabsList>

              {/* External Transfer Form */}
              <TabsContent value="external">
                <div className="mt-6">
                  <Form {...externalForm}>
                    <form
                      onSubmit={externalForm.handleSubmit(onExternalSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={externalForm.control}
                        name="fromAccountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Account</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem
                                    key={account.id}
                                    value={account.id.toString()}
                                  >
                                    {account.type} - {account.accountNumber} (
                                    {formatIndianCurrency(account.balance)})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the account to transfer from
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={externalForm.control}
                        name="toAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Account Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter destination account number"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the recipient's account number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={externalForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Enter amount"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the amount to transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={externalForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter transaction description"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Add a note for this transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading || accounts.length === 0}
                        >
                          {isLoading ? "Processing..." : "Transfer Funds"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              {/* Internal Transfer Form */}
              <TabsContent value="internal">
                <div className="mt-6">
                  <Form {...internalForm}>
                    <form
                      onSubmit={internalForm.handleSubmit(onInternalSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={internalForm.control}
                          name="fromAccountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Account</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select source account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id.toString()}
                                    >
                                      {account.type} - {account.accountNumber} (
                                      {formatIndianCurrency(account.balance)})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={internalForm.control}
                          name="toAccountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To Account</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select destination account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id.toString()}
                                    >
                                      {account.type} - {account.accountNumber} (
                                      {formatIndianCurrency(account.balance)})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={internalForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Enter amount"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the amount to transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={internalForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter transaction description"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Add a note for this transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading || accounts.length < 2}
                        >
                          {isLoading
                            ? "Processing..."
                            : "Transfer Between Accounts"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Transfers are processed instantly during banking hours
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TransferPage;
