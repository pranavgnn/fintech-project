import React from "react";
import { useNavigate } from "react-router";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import OffersList from "@/components/admin/OffersList";

const AdminOffersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateOffer = () => {
    navigate("/admin/offers/create");
  };

  const handleEditOffer = (offer: any) => {
    navigate(`/admin/offers/edit/${offer.id}`);
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Offers Management
          </h2>
          <Button onClick={handleCreateOffer}>
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Offers</CardTitle>
            <CardDescription>Manage special offers for users</CardDescription>
          </CardHeader>
          <CardContent>
            <OffersList onEditOffer={handleEditOffer} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOffersPage;
