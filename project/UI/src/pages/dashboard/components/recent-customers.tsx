import { Customer } from '@/types'
import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface RecentCustomersProps {
  customers: Customer[]
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  if (customers.length === 0) {
    return <p className="text-sm text-muted-foreground">No customers available.</p>
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      {customers.map(customer => (
        <div key={customer.id} className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground">{customer.contactDetails.email}</div>
          </div>
        </div>
      ))}
      {customers.length > 0 && (
        <div className="pt-2">
          <Link 
            to="/customers" 
            className="text-sm font-medium text-primary hover:underline"
          >
            View all customers
          </Link>
        </div>
      )}
    </div>
  )
}
