import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchCustomers, fetchOffers } from '@/lib/api'
import { Customer, Offer } from '@/types'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { DashboardStats } from './components/dashboard-stats'
import { RecentOffers } from './components/recent-offers'
import { RecentCustomers } from './components/recent-customers'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [customersData, offersData] = await Promise.all([
          fetchCustomers(),
          fetchOffers()
        ])
        setCustomers(customersData)
        setOffers(offersData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardStats customers={customers} offers={offers} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOffers offers={offers.slice(0, 5)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCustomers customers={customers.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
