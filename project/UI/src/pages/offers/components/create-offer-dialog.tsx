import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createOffer } from '@/lib/api'
import { Offer } from '@/types'
import { Spinner } from '@/components/ui/spinner'

interface CreateOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (offer: Offer) => void
}

export function CreateOfferDialog({ open, onOpenChange, onSuccess }: CreateOfferDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<Offer, 'id'>>({
    offerType: '',
    description: '',
    validTill: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.offerType || !formData.description || !formData.validTill) {
      toast.error('Please fill all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      const result = await createOffer(formData)
      onSuccess(result)
      // Reset form
      setFormData({
        offerType: '',
        description: '',
        validTill: ''
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create offer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Offer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="offerType">Offer Type</Label>
              <Input
                id="offerType"
                name="offerType"
                placeholder="Enter offer type"
                value={formData.offerType}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter offer description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validTill">Valid Till</Label>
              <Input
                id="validTill"
                name="validTill"
                type="datetime-local"
                value={formData.validTill}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
              Create Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
