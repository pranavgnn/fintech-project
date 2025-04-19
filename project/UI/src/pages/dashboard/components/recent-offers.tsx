import { Offer } from '@/types'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'

interface RecentOffersProps {
  offers: Offer[]
}

export function RecentOffers({ offers }: RecentOffersProps) {
  if (offers.length === 0) {
    return <p className="text-sm text-muted-foreground">No offers available.</p>
  }

  return (
    <div className="space-y-4">
      {offers.map(offer => (
        <div key={offer.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">{offer.offerType}</div>
            <div className="text-sm text-muted-foreground line-clamp-1">{offer.description}</div>
            <div className="text-xs text-muted-foreground">
              Valid till: {new Date(offer.validTill).toLocaleDateString()}
            </div>
          </div>
          <Badge variant={new Date(offer.validTill) > new Date() ? "default" : "destructive"}>
            {new Date(offer.validTill) > new Date() ? "Active" : "Expired"}
          </Badge>
        </div>
      ))}
      {offers.length > 0 && (
        <div className="pt-2">
          <Link 
            to="/offers" 
            className="text-sm font-medium text-primary hover:underline"
          >
            View all offers
          </Link>
        </div>
      )}
    </div>
  )
}
