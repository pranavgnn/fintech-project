import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, LinkIcon } from 'lucide-react'

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

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:8080/api/accounts/${id}`)
        setAccount(response.data)
      } catch (error) {
        console.error('Error fetching account details:', error)
        toast.error('Failed to load account details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAccountDetails()
    }
  }, [id])

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return
    }

    try {
      setDeleteLoading(true)
      await axios.delete(`http://localhost:8080/api/accounts/${id}`)
      toast.success('Account deleted successfully')
      navigate('/accounts')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/accounts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accounts
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : account ? (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Account #{account.number}</CardTitle>
                  <CardDescription>Type: {account.type}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/accounts/${id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Account ID</h3>
                  <p className="text-lg">{account.id}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Account Number</h3>
                  <p className="text-lg">{account.number}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
                  <p className="text-lg font-medium">₹{account.balance.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                  <p className="text-lg">{account.type}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                {account.customer ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-base">Name: {account.customer.name}</p>
                      <p className="text-sm text-muted-foreground">Customer ID: {account.customer.id}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/customers/${account.customer.id}`}>
                        View Customer
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-orange-500">This account is not assigned to any customer</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/accounts/assign">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Assign to Customer
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 py-4">
              <div className="text-sm text-muted-foreground">
                <p>You can manage this account's settings or assign it to a customer.</p>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Account not found</h2>
            <p className="text-muted-foreground mb-6">The account you're looking for does not exist or has been deleted.</p>
            <Button asChild>
              <Link to="/accounts">View All Accounts</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 