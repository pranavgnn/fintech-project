import { Offer } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Users, Trash } from 'lucide-react'

interface OffersTableProps {
  offers: Offer[]
  onDelete: (id: number) => void
  onAssign: (offer: Offer) => void
}

export function OffersTable({ offers, onDelete, onAssign }: OffersTableProps) {
  if (offers.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No offers found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Offer Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Valid Till</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map(offer => (
            <TableRow key={offer.id}>
              <TableCell className="font-medium">{offer.offerType}</TableCell>
              <TableCell className="max-w-[300px] truncate">{offer.description}</TableCell>
              <TableCell>{new Date(offer.validTill).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={new Date(offer.validTill) > new Date() ? "default" : "destructive"}>
                  {new Date(offer.validTill) > new Date() ? "Active" : "Expired"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAssign(offer)}>
                      <Users className="mr-2 h-4 w-4" />
                      Assign to Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => offer.id && onDelete(offer.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Offer
                    </DropdownMenuItem>
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
