import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, UserCheck, User } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Offer {
  id: number;
  title: string;
  category: string;
  discount: string;
  validFrom: string;
  validUntil: string;
  targetType: "ALL_USERS" | "SELECTED_USERS" | "CRITERIA_BASED";
  active: boolean;
  targetUsers?: Array<{ id: number; name: string }>;
}

interface OffersListProps {
  onEditOffer: (offer: Offer) => void;
}

const OffersList: React.FC<OffersListProps> = ({ onEditOffer }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/offers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch offers: ${response.status}`);
      }

      const data = await response.json();
      setOffers(data);
    } catch (err: any) {
      console.error("Error fetching offers:", err);
      setError(err.message || "Failed to load offers");
      toast.error("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/offers/${offerToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete offer: ${response.status}`);
      }

      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (err: any) {
      console.error("Error deleting offer:", err);
      toast.error(err.message || "Failed to delete offer");
    } finally {
      setDeleteDialogOpen(false);
      setOfferToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {error}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No offers found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Target Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offer.category || "-"}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p>
                      From: {format(new Date(offer.validFrom), "dd MMM yyyy")}
                    </p>
                    <p>
                      Until: {format(new Date(offer.validUntil), "dd MMM yyyy")}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {offer.targetType === "ALL_USERS" && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      All Users
                    </Badge>
                  )}
                  {offer.targetType === "SELECTED_USERS" && (
                    <Badge className="flex items-center gap-1 bg-blue-500">
                      <UserCheck className="h-3 w-3" />
                      Selected ({offer.targetUsers?.length || 0})
                    </Badge>
                  )}
                  {offer.targetType === "CRITERIA_BASED" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <User className="h-3 w-3" />
                      Criteria
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {offer.active ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditOffer(offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(offer)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the offer "{offerToDelete?.title}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OffersList;
