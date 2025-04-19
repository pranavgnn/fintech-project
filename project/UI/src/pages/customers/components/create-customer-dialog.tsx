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
import { createCustomer } from '@/lib/api'
import { Customer } from '@/types'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (customer: Customer) => void
}

export function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState<Customer>({
    name: '',
    pass: '',
    contactDetails: {
      email: '',
      phoneNo: ''
    },
    kyc: {
      dob: '',
      address: {
        line1: '',
        line2: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: ''
      },
      adhaar: '',
      pan: ''
    }
  })

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        [name]: value
      }
    }))
  }

  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        [name]: value
      }
    }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        address: {
          ...prev.kyc.address,
          [name]: value
        }
      }
    }))
  }

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name || !formData.pass) {
      toast.error('Name and password are required')
      setActiveTab('basic')
      return false
    }
    
    // Contact validation
    if (!formData.contactDetails.email || !formData.contactDetails.phoneNo) {
      toast.error('Email and phone number are required')
      setActiveTab('contact')
      return false
    }
    
    // KYC validation
    if (!formData.kyc.dob || !formData.kyc.adhaar || !formData.kyc.pan) {
      toast.error('Date of birth, Adhaar, and PAN are required')
      setActiveTab('kyc')
      return false
    }
    
    // Address validation
    const { address } = formData.kyc
    if (!address.line1 || !address.street || !address.city || !address.state || !address.country || !address.zipcode) {
      toast.error('Address fields are required (except Line 2)')
      setActiveTab('address')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      const result = await createCustomer(formData)
      onSuccess(result)
      // Reset form
      setFormData({
        name: '',
        pass: '',
        contactDetails: {
          email: '',
          phoneNo: ''
        },
        kyc: {
          dob: '',
          address: {
            line1: '',
            line2: '',
            street: '',
            city: '',
            state: '',
            country: '',
            zipcode: ''
          },
          adhaar: '',
          pan: ''
        }
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleBasicChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pass">Password</Label>
                <Input
                  id="pass"
                  name="pass"
                  type="password"
                  placeholder="Enter password"
                  value={formData.pass}
                  onChange={handleBasicChange}
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.contactDetails.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  name="phoneNo"
                  placeholder="Enter phone number"
                  value={formData.contactDetails.phoneNo}
                  onChange={handleContactChange}
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="kyc" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.kyc.dob}
                  onChange={handleKycChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adhaar">Adhaar Number</Label>
                <Input
                  id="adhaar"
                  name="adhaar"
                  placeholder="Enter 12-digit Adhaar number"
                  value={formData.kyc.adhaar}
                  onChange={handleKycChange}
                  required
                  maxLength={12}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  name="pan"
                  placeholder="Enter PAN number"
                  value={formData.kyc.pan}
                  onChange={handleKycChange}
                  required
                  maxLength={10}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="line1">Line 1</Label>
                  <Input
                    id="line1"
                    name="line1"
                    placeholder="Building/House number"
                    value={formData.kyc.address.line1}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="line2">Line 2 (Optional)</Label>
                  <Input
                    id="line2"
                    name="line2"
                    placeholder="Apartment/Suite number"
                    value={formData.kyc.address.line2}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="Enter street name"
                  value={formData.kyc.address.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.kyc.address.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state"
                    value={formData.kyc.address.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipcode">ZIP Code</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    placeholder="Enter postal code"
                    value={formData.kyc.address.zipcode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Enter country"
                    value={formData.kyc.address.country}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
