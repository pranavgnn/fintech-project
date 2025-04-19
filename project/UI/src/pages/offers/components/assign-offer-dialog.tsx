import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchCustomers, assignOfferToCustomer } from '@/lib/api'
import { Offer, Customer } from '@/types'
import { Spinner } from '@/components/ui/spinner'

interface AssignOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: Offer
}

export function AssignOfferDialog({ open, onOpenChange, offer }: AssignOfferDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true)
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load customers')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadCustomers()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomerId) {
      toast.error('Please select a customer')
      return
    }
    
    try {
      setIsSubmitting(true)
      await assignOfferToCustomer(offer.id!, parseInt(selectedCustomerId))
      toast.success('Offer assigned to customer successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign offer to customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="assign-offer-description"
      >
        <DialogHeader>
          <DialogTitle>Assign Offer to Customer</DialogTitle>
          <p id="assign-offer-description" className="text-sm text-muted-foreground">
            Select a customer to assign this offer to.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Offer</Label>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">{offer.offerType}</p>
                <p className="text-muted-foreground mt-1">{offer.description}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerId">Select Customer</Label>
              {isLoading ? (
                <div className="flex h-10 items-center justify-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name} ({customer.contactDetails.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCustomerId}>
              {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
              Assign Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
