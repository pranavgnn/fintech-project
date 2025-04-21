import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "@/components/layouts/AdminLayout";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define interface for User objects
interface User {
  id: number;
  name: string;
  email: string;
}

// Create a schema for form validation
const offerSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required"),
  validFrom: z.date({ required_error: "Valid from date is required" }),
  validUntil: z.date({ required_error: "Valid until date is required" }),
  discount: z.string().optional(),
  targetType: z.enum(["ALL_USERS", "SELECTED_USERS", "CRITERIA_BASED"]),
  targetCriteria: z.string().optional(),
  targetUserIds: z.array(z.number()).default([]),
  active: z.boolean().default(true),
});

// Type inference from the schema
type OfferFormValues = z.infer<typeof offerSchema>;

const OfferFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { offerId } = useParams<{ offerId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Initialize form with default values
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      discount: "",
      targetType: "ALL_USERS",
      targetCriteria: "",
      targetUserIds: [],
      active: true,
    },
  });

  // Fetch offer data if editing
  useEffect(() => {
    if (offerId) {
      setIsEditing(true);
      fetchOfferData(offerId);
    }
    fetchUsers();
  }, [offerId]);

  // Fetch offer data
  const fetchOfferData = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/offers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch offer: ${response.status}`);
      }

      const offer = await response.json();

      // Set selected users
      const userIds = offer.targetUsers?.map((user: any) => user.id) || [];
      setSelectedUserIds(userIds);

      // Set form values
      form.reset({
        title: offer.title || "",
        description: offer.description || "",
        category: offer.category || "",
        validFrom: offer.validFrom ? new Date(offer.validFrom) : new Date(),
        validUntil: offer.validUntil
          ? new Date(offer.validUntil)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        discount: offer.discount || "",
        targetType: offer.targetType || "ALL_USERS",
        targetCriteria: offer.targetCriteria || "",
        targetUserIds: userIds,
        active: offer.active !== undefined ? offer.active : true,
      });
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("Failed to load offer data");
      navigate("/admin/offers");
    }
  };

  // Fetch available users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  // Handle user selection for targeted offers
  const handleUserSelection = (userId: number, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const newSelection = checked
        ? [...prev, userId]
        : prev.filter((id) => id !== userId);

      form.setValue("targetUserIds", newSelection);
      return newSelection;
    });
  };

  // Handle form submission
  const onSubmit = async (values: OfferFormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Validate that selected users are provided when targetType is SELECTED_USERS
      if (
        values.targetType === "SELECTED_USERS" &&
        values.targetUserIds.length === 0
      ) {
        throw new Error("Please select at least one user for targeted offers");
      }

      // Format dates properly for Java backend
      const formattedValidFrom = format(
        values.validFrom,
        "yyyy-MM-dd'T'HH:mm:ss"
      );
      const formattedValidUntil = format(
        values.validUntil,
        "yyyy-MM-dd'T'HH:mm:ss"
      );

      const payload = {
        ...values,
        validFrom: formattedValidFrom,
        validUntil: formattedValidUntil,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/admin/offers/${offerId}`
        : "/api/admin/offers";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          throw new Error("You don't have permission to manage offers");
        } else if (response.status === 401) {
          throw new Error("Authentication expired. Please login again");
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `Error: ${response.status}`);
          } catch (e) {
            throw new Error(`Error: ${response.status}. ${errorText}`);
          }
        }
      }

      toast.success(
        isEditing ? "Offer updated successfully" : "Offer created successfully"
      );
      navigate("/admin/offers");
    } catch (error: any) {
      console.error("Error saving offer:", error);
      setApiError(error.message || "Failed to save offer");
      toast.error(error.message || "Failed to save offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-6 md:p-8">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/offers")}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Offer" : "Create New Offer"}
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Update Offer" : "Create Offer"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the offer details below"
                : "Fill in the details to create a new offer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter offer title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Savings">Savings</SelectItem>
                            <SelectItem value="Transfer">Transfer</SelectItem>
                            <SelectItem value="Credit Card">
                              Credit Card
                            </SelectItem>
                            <SelectItem value="Loan">Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter offer description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                asChild
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid Until</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 10%, 50 INR off, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify the discount amount or percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ALL_USERS">All Users</SelectItem>
                          <SelectItem value="SELECTED_USERS">
                            Selected Users
                          </SelectItem>
                          <SelectItem value="CRITERIA_BASED">
                            Criteria Based
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determine who will be eligible for this offer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show user selection when targetType is SELECTED_USERS */}
                {form.watch("targetType") === "SELECTED_USERS" && (
                  <div>
                    <FormLabel>Selected Users</FormLabel>
                    <div className="mt-2 border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                      {users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Loading users...
                        </p>
                      ) : (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={(checked) =>
                                handleUserSelection(user.id, checked === true)
                              }
                            />
                            <label
                              htmlFor={`user-${user.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {user.name} ({user.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedUserIds.length === 0 &&
                      form.watch("targetType") === "SELECTED_USERS" && (
                        <p className="text-xs text-amber-500 mt-2">
                          Please select at least one user
                        </p>
                      )}
                  </div>
                )}

                {/* Show criteria field when targetType is CRITERIA_BASED */}
                {form.watch("targetType") === "CRITERIA_BASED" && (
                  <FormField
                    control={form.control}
                    name="targetCriteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Criteria</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. account.balance > 10000 AND user.age > 25"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify criteria for eligible users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          This offer will be visible to users if active
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/offers")}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Offer"
                : "Create Offer"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OfferFormPage;
