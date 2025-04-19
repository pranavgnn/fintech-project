import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Plus, RefreshCw } from 'lucide-react'
import { fetchCustomers, deleteCustomer } from '@/lib/api'
import { Customer } from '@/types'
import { CustomersTable } from './components/customers-table'
import { CreateCustomerDialog } from './components/create-customer-dialog'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadCustomers = async (showRefreshIndicator = false) => {
    try {
      setFetchError(null);
      
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const data = await fetchCustomers()
      
      // Log success for debugging
      console.log('Fetched customers:', data?.length || 0);
      
      setCustomers(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load customers';
      console.error('Error loading customers:', errorMessage)
      setFetchError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial load with retry logic
    const attemptLoad = async () => {
      try {
        await loadCustomers();
      } catch (error) {
        // Auto-retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      }
    };
    
    attemptLoad();
  }, [retryCount]);

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id)
      // Refresh the full list to ensure consistency
      loadCustomers(true)
      toast.success('Customer deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete customer')
    }
  }

  const handleCreateSuccess = (newCustomer: Customer) => {
    // Refresh the entire list instead of just adding the new customer
    loadCustomers(true)
    setIsCreateDialogOpen(false)
    toast.success('Customer created successfully')
  }

  const handleRefresh = () => {
    loadCustomers(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Customer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : fetchError ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8">
          <p className="text-red-500 font-medium mb-4">Error loading customers: {fetchError}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : (
        <CustomersTable 
          customers={customers} 
          onDelete={handleDelete} 
          isRefreshing={isRefreshing}
        />
      )}

      <CreateCustomerDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onSuccess={handleCreateSuccess} 
      />
    </div>
  )
}
