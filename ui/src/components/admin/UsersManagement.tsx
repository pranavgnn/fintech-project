import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const UsersManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>View and manage user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          User management features are currently under development.
        </p>
      </CardContent>
    </Card>
  );
};

export default UsersManagement;
