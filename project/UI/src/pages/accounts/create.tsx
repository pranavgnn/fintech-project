import { useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    balance: '',
    type: 'SAVINGS' // Default account type
  })

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
      setLoading(true)

      // Create the account object with proper formatting
      const accountData = {
        number: formData.number,
        balance: parseFloat(formData.balance),
        type: formData.type
      }

      await axios.post('http://localhost:8080/api/accounts', accountData)
      toast.success('Account created successfully')
      navigate('/accounts')
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
            <CardDescription>Enter the details for the new bank account</CardDescription>
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
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  placeholder="Enter initial balance"
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
                onClick={() => navigate('/accounts')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 