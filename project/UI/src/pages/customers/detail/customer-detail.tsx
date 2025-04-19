import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { fetchCustomerById, getCustomerOffers, removeOfferFromCustomer } from '@/lib/api'
import { Customer, Offer } from '@/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { CustomerInfo } from './components/customer-info'
import { CustomerOffers } from './components/customer-offers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('info')

  const loadCustomerData = async (showRefreshIndicator = false) => {
    if (!id) return

    try {
      setFetchError(null);
      
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      // Add cache busting parameter
      const customerId = parseInt(id);
      
      try {
        const [customerData, offersData] = await Promise.all([
          fetchCustomerById(customerId),
          getCustomerOffers(customerId)
        ])
        
        console.log('Loaded customer data:', customerData);
        console.log('Loaded offers data:', offersData);
        
        if (!customerData) {
          throw new Error('Customer data is empty');
        }
        
        setCustomer(customerData)
        setOffers(Array.isArray(offersData) ? offersData : [])
      } catch (error) {
        console.error('Error loading customer data:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to load customer data');
        toast.error(error instanceof Error ? error.message : 'Failed to load customer data');
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadCustomerData()
  }, [id])

  const handleRemoveOffer = async (offerId: number) => {
    if (!id) return

    try {
      await removeOfferFromCustomer(offerId, parseInt(id))
      setOffers(offers.filter(offer => offer.id !== offerId))
      toast.success('Offer removed from customer successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove offer from customer')
    }
  }
  
  const handleRefresh = () => {
    loadCustomerData(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (fetchError || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8">
          <p className="text-red-500 font-medium mb-4">
            {fetchError || 'Customer not found'}
          </p>
          {fetchError && (
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Customer Info</TabsTrigger>
          <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 py-4">
          <CustomerInfo customer={customer} />
        </TabsContent>
        
        <TabsContent value="offers" className="space-y-4 py-4">
          <CustomerOffers 
            offers={offers} 
            onRemoveOffer={handleRemoveOffer} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
