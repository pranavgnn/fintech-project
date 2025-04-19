import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Customer, Offer } from '@/types'
import { Users, Package, Calendar } from 'lucide-react'

interface DashboardStatsProps {
  customers: Customer[]
  offers: Offer[]
}

export function DashboardStats({ customers, offers }: DashboardStatsProps) {
  const activeOffers = offers.filter(offer => {
    const validTill = new Date(offer.validTill)
    return validTill > new Date()
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOffers.length}</div>
        </CardContent>
      </Card>
    </div>
  )
}
