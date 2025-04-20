import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  kyc?: {
    id: number;
    dateOfBirth?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    address?: {
      id: number;
      line1?: string;
      line2?: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  accounts?: Array<{
    id: number;
    accountNumber: string;
    balance: number;
    type: string;
  }>;
}

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
  const isOwnProfile = currentUser?.id === Number(userId) || !userId;
  const viewingUserId = userId || currentUser?.id;

  useEffect(() => {
    if (!viewingUserId) {
      toast.error("User ID is required");
      navigate(isAdmin ? "/admin/users" : "/dashboard");
      return;
    }
    fetchUserDetails(viewingUserId);
  }, [viewingUserId]);

  const fetchUserDetails = async (id: string | number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found");
        navigate("/login");
        return;
      }

      const response = await fetch(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
      navigate(isAdmin ? "/admin/users" : "/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Use the appropriate layout based on user role and context
  const Layout = isAdmin && !isOwnProfile ? AdminLayout : DashboardLayout;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              navigate(isAdmin && !isOwnProfile ? "/admin/users" : "/dashboard")
            }
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isOwnProfile ? "My Profile" : "User Details"}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="financial">Financial Info</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Personal details and application access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">User ID</p>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Full Name
                      </p>
                      <p className="text-muted-foreground">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Email</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Phone Number
                      </p>
                      <p className="text-muted-foreground">
                        {user.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Roles</p>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map((role) => (
                          <Badge
                            key={role}
                            variant={
                              role.includes("ADMIN") ? "default" : "outline"
                            }
                          >
                            {role.replace("ROLE_", "")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {user.kyc && (
                    <>
                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          KYC Information
                        </h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Date of Birth
                            </p>
                            <p className="text-muted-foreground">
                              {formatDate(user.kyc.dateOfBirth)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Aadhaar Number
                            </p>
                            <p className="text-muted-foreground">
                              {user.kyc.aadhaarNumber || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              PAN Number
                            </p>
                            <p className="text-muted-foreground">
                              {user.kyc.panNumber || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {user.kyc?.address && (
                    <>
                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-2">Address</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Street Address
                            </p>
                            <p className="text-muted-foreground">
                              {`${user.kyc.address.line1 || ""} ${
                                user.kyc.address.line2 || ""
                              }`.trim() || "Not provided"}
                            </p>
                            <p className="text-muted-foreground">
                              {user.kyc.address.street || ""}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              City, State
                            </p>
                            <p className="text-muted-foreground">
                              {`${user.kyc.address.city || ""}, ${
                                user.kyc.address.state || ""
                              }`.trim() || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Country
                            </p>
                            <p className="text-muted-foreground">
                              {user.kyc.address.country || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              ZIP Code
                            </p>
                            <p className="text-muted-foreground">
                              {user.kyc.address.zipCode || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>
                    Account details and balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Accounts</h4>

                    {user.accounts && user.accounts.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account Number</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">
                                Balance
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.accounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">
                                  {account.accountNumber}
                                </TableCell>
                                <TableCell>{account.type}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(account.balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No accounts found.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                User not found or you don't have permission to view this user.
              </p>
              <Button
                onClick={() =>
                  navigate(isAdmin ? "/admin/users" : "/dashboard")
                }
                className="mt-4"
              >
                Go back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UserDetailsPage;
