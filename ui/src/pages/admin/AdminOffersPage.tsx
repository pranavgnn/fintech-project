import React from "react";
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
import OfferFormDialog from "@/components/admin/OfferFormDialog";

const AdminOffersPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOffer, setEditingOffer] = React.useState<any>(null);

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setIsDialogOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setIsDialogOpen(true);
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

        {/* Create/Edit Offer Dialog */}
        <OfferFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          offer={editingOffer}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminOffersPage;
