import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Search, Trash2 } from "lucide-react";
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

interface Offer {
  id: number;
  title: string;
  description: string;
  category: string;
  validFrom: string;
  validUntil: string;
  discount?: string;
  targetType: string;
  targetCriteria?: string;
  targetUsers?: any[];
  createdAt: string;
}

interface OffersListProps {
  onEditOffer: (offer: Offer) => void;
}

const OffersList: React.FC<OffersListProps> = ({ onEditOffer }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    // Filter offers based on search query and active tab
    let filtered = offers;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(query) ||
          offer.description.toLowerCase().includes(query) ||
          offer.category.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    const now = new Date();
    if (activeTab === "active") {
      filtered = filtered.filter(
        (offer) =>
          new Date(offer.validFrom) <= now && new Date(offer.validUntil) > now
      );
    } else if (activeTab === "scheduled") {
      filtered = filtered.filter((offer) => new Date(offer.validFrom) > now);
    } else if (activeTab === "expired") {
      filtered = filtered.filter((offer) => new Date(offer.validUntil) <= now);
    }

    setFilteredOffers(filtered);
  }, [searchQuery, activeTab, offers]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/offers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch offers");
      }

      const data = await response.json();
      setOffers(data);
      setFilteredOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");

      // Set empty arrays as fallback
      setOffers([]);
      setFilteredOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    setConfirmDeleteId(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/offers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete offer");
      }

      toast.success("Offer deleted successfully");
      fetchOffers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);

    if (validFrom > now) {
      return "scheduled";
    } else if (validUntil <= now) {
      return "expired";
    } else {
      return "active";
    }
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search offers by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Offers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchQuery || activeTab !== "all"
                          ? "No offers match your current filters"
                          : "No offers found. Create your first offer!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer) => {
                      const status = getOfferStatus(offer);
                      return (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">
                            <div
                              className="max-w-[250px] truncate"
                              title={offer.title}
                            >
                              {offer.title}
                            </div>
                          </TableCell>
                          <TableCell>{offer.category}</TableCell>
                          <TableCell>
                            {offer.targetType === "ALL_USERS"
                              ? "All Users"
                              : offer.targetType === "SELECTED_USERS"
                              ? `${offer.targetUsers?.length || 0} Users`
                              : "Criteria Based"}
                          </TableCell>
                          <TableCell>
                            {new Date(offer.validUntil).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                status === "active"
                                  ? "default"
                                  : status === "scheduled"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditOffer(offer)}
                                title="Edit offer"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConfirmDeleteId(offer.id)}
                                title="Delete offer"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this offer. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDeleteId && handleDeleteOffer(confirmDeleteId)
              }
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
