import { Offer } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Card } from '@/components/ui/card'
import { Trash } from 'lucide-react'

interface CustomerOffersProps {
  offers: Offer[]
  onRemoveOffer: (offerId: number) => Promise<void>
}

export function CustomerOffers({ offers, onRemoveOffer }: CustomerOffersProps) {
  if (offers.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">No offers assigned to this customer</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {offers.map(offer => (
        <Card key={offer.id} className="p-4">
          <div className="flex justify-between">
            <Badge variant={new Date(offer.validTill) > new Date() ? "default" : "destructive"}>
              {new Date(offer.validTill) > new Date() ? "Active" : "Expired"}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove offer</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Offer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove this offer from the customer? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => offer.id && onRemoveOffer(offer.id)}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="mt-3 space-y-2">
            <h3 className="font-semibold">{offer.offerType}</h3>
            <p className="text-sm text-muted-foreground">{offer.description}</p>
            <p className="text-xs text-muted-foreground">
              Valid till: {new Date(offer.validTill).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
