import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Customer {
  id: number
  name: string
}

interface Account {
  id: number
  number: string
  customer?: {
    id: number
  }
}

export default function AssignAccount() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [customersResponse, accountsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/customers'),
          axios.get('http://localhost:8080/api/accounts')
        ])
        
        setCustomers(customersResponse.data)
        // Filter out accounts that are already assigned to customers
        const unassignedAccounts = accountsResponse.data.filter(
          (account: Account) => !account.customer || !account.customer.id
        )
        setAccounts(accountsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAccountId || !selectedCustomerId) {
      toast.error('Please select both an account and a customer')
      return
    }

    try {
      setLoading(true)

      await axios.post(`http://localhost:8080/api/accounts/assign`, null, {
        params: {
          accountId: selectedAccountId,
          customerId: selectedCustomerId
        }
      })
      
      toast.success('Account assigned successfully')
      navigate('/accounts')
    } catch (error) {
      console.error('Error assigning account:', error)
      toast.error('Failed to assign account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assign Account to Customer</CardTitle>
            <CardDescription>Select an account and customer to assign</CardDescription>
          </CardHeader>
          {dataLoading ? (
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Select Account</Label>
                  <Select 
                    value={selectedAccountId} 
                    onValueChange={setSelectedAccountId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          Account #{account.number} {account.customer?.id ? '(Already assigned)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select 
                    value={selectedCustomerId} 
                    onValueChange={setSelectedCustomerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/accounts')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
} 