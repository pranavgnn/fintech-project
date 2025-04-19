import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

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

export default function EditAccount() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    balance: '',
    type: ''
  })

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:8080/api/accounts/${id}`)
        const account = response.data
        
        setFormData({
          number: account.number,
          balance: account.balance.toString(),
          type: account.type
        })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.number || !formData.balance) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaveLoading(true)

      // Create the account object with proper formatting
      const accountData = {
        id: id,
        number: formData.number,
        balance: parseFloat(formData.balance),
        type: formData.type
      }

      await axios.put(`http://localhost:8080/api/accounts/${id}`, accountData)
      toast.success('Account updated successfully')
      navigate(`/accounts/${id}`)
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error('Failed to update account')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/accounts/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account Details
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Edit Account</CardTitle>
              <CardDescription>Update account details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Account Number</Label>
                  <Input
                    id="number"
                    name="number"
                    placeholder="Enter account number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">Balance</Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    step="0.01"
                    placeholder="Enter balance"
                    value={formData.balance}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Account Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="CHECKING">Checking</SelectItem>
                      <SelectItem value="INVESTMENT">Investment</SelectItem>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/accounts/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
} 