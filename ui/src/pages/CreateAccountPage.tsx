import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema definition for account creation form
const accountFormSchema = z.object({
  type: z.enum(["SAVINGS", "CHECKING", "FIXED_DEPOSIT"], {
    required_error: "Please select an account type",
  }),
  initialBalance: z
    .string()
    .min(1, "Initial deposit amount is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 1000;
      },
      { message: "Initial deposit must be at least ₹1000" }
    ),
});

// Type inference from the schema
type AccountFormValues = z.infer<typeof accountFormSchema>;

const CreateAccountPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: "SAVINGS",
      initialBalance: "1000",
    },
  });

  // Form submission handler
  const onSubmit = async (formData: AccountFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create an account");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the request payload
      const accountData = {
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance),
      };

      console.log("Creating account with data:", accountData);

      // Send API request
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user.id}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create account";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      // Success handling
      const newAccount = await response.json();
      console.log("Account created successfully:", newAccount);

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error creating account:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Create New Account
          </h2>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>New Bank Account</CardTitle>
            <CardDescription>
              Open a new account with FinnBank to manage your finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SAVINGS">
                            Savings Account
                          </SelectItem>
                          <SelectItem value="CHECKING">
                            Checking Account
                          </SelectItem>
                          <SelectItem value="FIXED_DEPOSIT">
                            Fixed Deposit
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of account you want to open.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Deposit (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1000"
                          step="100"
                          placeholder="1000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum initial deposit is ₹1000.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateAccountPage;
