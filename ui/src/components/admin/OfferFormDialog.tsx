import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { CustomTextarea } from "@/components/ui/custom-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/ui/custom-button";

// Define interface for User objects
interface User {
  id: number;
  name: string;
  email: string;
}

// Define props for the dialog component
interface OfferFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: any; // The offer to edit, null if creating new
  onSuccess?: () => void; // Callback when operation succeeds
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

const OfferFormDialog: React.FC<OfferFormDialogProps> = ({
  isOpen,
  onClose,
  offer,
  onSuccess,
}) => {
  // Component state
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Fetch users when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setApiError(null);
    }
  }, [isOpen]);

  // Reset form when offer changes or dialog closes/opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (offer) {
      const userIds = offer.targetUsers?.map((user: any) => user.id) || [];
      setSelectedUserIds(userIds);

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
    } else {
      setSelectedUserIds([]);
      form.reset({
        title: "",
        description: "",
        category: "",
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        discount: "",
        targetType: "ALL_USERS",
        targetCriteria: "",
        targetUserIds: [],
        active: true,
      });
    }
  }, [offer, isOpen, form]);

  // Fetch available users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

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
      toast.error("Failed to load users for targeting");
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

      console.log("Sending offer payload:", payload);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const method = offer ? "PUT" : "POST";
      const url = offer ? `/api/admin/offers/${offer.id}` : "/api/admin/offers";

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
        console.error("Error response:", errorText);

        if (response.status === 403) {
          throw new Error("You don't have permission to manage offers");
        } else if (response.status === 401) {
          throw new Error("Authentication expired. Please login again");
        } else {
          try {
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `Error: ${response.status}`);
          } catch (e) {
            // If not valid JSON, use the text directly
            throw new Error(`Error: ${response.status}. ${errorText}`);
          }
        }
      }

      toast.success(
        offer ? "Offer updated successfully" : "Offer created successfully"
      );

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving offer:", error);
      setApiError(error.message || "Failed to save offer");
      toast.error(
        error.message ||
          (offer ? "Failed to update offer" : "Failed to create offer")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close with confirmation if form is dirty
  const handleDialogClose = () => {
    if (form.formState.isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
          <DialogDescription>
            {offer
              ? "Update the offer details below."
              : "Fill in the details to create a new offer."}
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4">
            {apiError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
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
                    <CustomTextarea
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
                          <CustomButton
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
                          </CustomButton>
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
                          <CustomButton
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
                          </CustomButton>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : offer
                  ? "Update Offer"
                  : "Create Offer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OfferFormDialog;
