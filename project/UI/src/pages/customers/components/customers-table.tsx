import { Customer } from '@/types'
import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash } from 'lucide-react'

interface CustomersTableProps {
  customers: Customer[]
  onDelete: (id: number) => void
  isRefreshing?: boolean
}

export function CustomersTable({ customers, onDelete }: CustomersTableProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No customers found</p>
      </div>
    )
  }

  function getInitials(name: string): string {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map(customer => (
            <TableRow key={customer.id || Math.random()}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(customer?.name || '')}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{customer?.name || 'Unknown'}</span>
                </div>
              </TableCell>
              <TableCell>{customer?.contactDetails?.email || 'N/A'}</TableCell>
              <TableCell>{customer?.contactDetails?.phoneNo || 'N/A'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {customer?.id && (
                      <DropdownMenuItem asChild>
                        <Link to={`/customers/${customer.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {customer?.id && (
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => onDelete(customer.id!)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Customer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
