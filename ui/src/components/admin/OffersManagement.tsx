import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const OffersManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offers Management</CardTitle>
        <CardDescription>
          Create and manage special offers for users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Offer management features are currently under development.
        </p>
      </CardContent>
    </Card>
  );
};

export default OffersManagement;
