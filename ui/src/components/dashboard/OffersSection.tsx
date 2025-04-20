import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarClock, Percent, CreditCard } from "lucide-react";

interface Offer {
  id: number;
  title: string;
  description: string;
  category: string;
  validUntil: string;
  discount?: string;
}

interface OffersSectionProps {
  onOffersLoaded?: (count: number) => void;
}

const OffersSection: React.FC<OffersSectionProps> = ({ onOffersLoaded }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [onOffersLoaded]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/offers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch offers. Status: ${response.status}`);
      }

      const data = await response.json();
      setOffers(data);
      if (onOffersLoaded) {
        onOffersLoaded(data.length);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("Could not load special offers");
      if (onOffersLoaded) {
        onOffersLoaded(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Special Offers</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchOffers}>
          Try Again
        </Button>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No special offers available at this time
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Special Offers</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Card key={offer.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{offer.title}</CardTitle>
                <Badge
                  variant={
                    offer.category === "Transfer"
                      ? "outline"
                      : offer.category === "Savings"
                      ? "secondary"
                      : "default"
                  }
                >
                  {offer.category}
                </Badge>
              </div>
              <CardDescription className="flex items-center mt-2">
                <CalendarClock className="h-4 w-4 mr-1" />
                Valid until {formatDate(offer.validUntil)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {offer.description}
              </p>
              {offer.discount && (
                <div className="mt-4 flex items-center">
                  {offer.category === "Credit Card" ? (
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  ) : (
                    <Percent className="h-5 w-5 mr-2 text-primary" />
                  )}
                  <span className="font-bold">{offer.discount}</span>
                </div>
              )}
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button className="w-full">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OffersSection;
