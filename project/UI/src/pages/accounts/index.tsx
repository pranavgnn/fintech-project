import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Account {
  id: number
  number: string
  balance: number
  type: string
  customer?: {
    id: number
    name: string
  }
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8080/api/accounts')
      setAccounts(response.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link to="/accounts/create">Create Account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/accounts/assign">Assign Account</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <Card key={account.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Account #{account.number}</CardTitle>
                  <CardDescription>Type: {account.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="text-lg font-semibold">
                      Balance: ₹{account.balance?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.customer ? (
                        <span>Assigned to: {account.customer.name}</span>
                      ) : (
                        <span className="text-orange-500">Not assigned to any customer</span>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/accounts/${account.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-4">No accounts found</p>
                <Button asChild>
                  <Link to="/accounts/create">Create your first account</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 