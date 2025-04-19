import { Customer } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Info, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react'

interface CustomerInfoProps {
  customer: Customer
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  function getInitials(name: string): string {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{getInitials(customer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{customer.name || 'N/A'}</h3>
              <p className="text-sm text-muted-foreground">
                Customer ID: {customer.id || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.contactDetails ? (
            <>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.contactDetails.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.contactDetails.phoneNo || 'N/A'}</span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No contact information available</p>
          )}
        </CardContent>
      </Card>

      {/* KYC Information */}
      {customer.kyc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              KYC Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(customer.kyc.dob)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adhaar Number</p>
                <p className="font-medium">{customer.kyc.adhaar || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN Number</p>
                <p className="font-medium">{customer.kyc.pan || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information */}
      {customer.kyc?.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{customer.kyc.address.line1 || 'N/A'}</p>
            {customer.kyc.address.line2 && <p>{customer.kyc.address.line2}</p>}
            <p>{customer.kyc.address.street || 'N/A'}</p>
            <p>
              {[
                customer.kyc.address.city,
                customer.kyc.address.state,
                customer.kyc.address.zipcode
              ].filter(Boolean).join(', ') || 'N/A'}
            </p>
            <p>{customer.kyc.address.country || 'N/A'}</p>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      {customer.accounts && customer.accounts.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Account Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customer.accounts.map((account, index) => (
                    <tr key={account.id || index}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">{account.number || 'N/A'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">{account.type || 'N/A'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        ${account.balance ? account.balance.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
