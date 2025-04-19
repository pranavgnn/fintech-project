import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { fetchOffers, deleteOffer } from '@/lib/api'
import { Offer } from '@/types'
import { OffersTable } from './components/offers-table'
import { CreateOfferDialog } from './components/create-offer-dialog'
import { AssignOfferDialog } from './components/assign-offer-dialog'

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const loadOffers = async () => {
    try {
      setIsLoading(true)
      const data = await fetchOffers()
      setOffers(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load offers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await deleteOffer(id)
      setOffers(offers.filter(offer => offer.id !== id))
      toast.success('Offer deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete offer')
    }
  }

  const handleCreateSuccess = (newOffer: Offer) => {
    setOffers([...offers, newOffer])
    setIsCreateDialogOpen(false)
    toast.success('Offer created successfully')
  }

  const handleAssign = (offer: Offer) => {
    setSelectedOffer(offer)
    setIsAssignDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Offers</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <OffersTable 
          offers={offers} 
          onDelete={handleDelete} 
          onAssign={handleAssign} 
        />
      )}

      <CreateOfferDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onSuccess={handleCreateSuccess} 
      />

      {selectedOffer && (
        <AssignOfferDialog 
          open={isAssignDialogOpen} 
          onOpenChange={setIsAssignDialogOpen} 
          offer={selectedOffer}
        />
      )}
    </div>
  )
}
