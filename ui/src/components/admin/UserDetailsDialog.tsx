import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatIndianCurrency } from "@/utils/formatters";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  createdAt: string;
  accounts?: any[];
  kyc?: any;
}

interface UserDetailsDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">ID:</span>
                <span className="col-span-2">{user.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Name:</span>
                <span className="col-span-2">{user.name}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Email:</span>
                <span className="col-span-2">{user.email}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Phone:</span>
                <span className="col-span-2">{user.phoneNumber}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Roles:</span>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {user.roles?.map((role) => (
                    <Badge
                      key={role}
                      variant={role.includes("ADMIN") ? "default" : "outline"}
                    >
                      {role.replace("ROLE_", "")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Joined:</span>
                <span className="col-span-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* KYC Information (if available) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">KYC Information</h3>
            {user.kyc ? (
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">DOB:</span>
                  <span className="col-span-2">
                    {new Date(user.kyc.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Aadhaar:</span>
                  <span className="col-span-2">{user.kyc.aadhaarNumber}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">PAN:</span>
                  <span className="col-span-2">{user.kyc.panNumber}</span>
                </div>

                {user.kyc.address && (
                  <div className="grid grid-cols-3 items-start gap-4 mt-2">
                    <span className="text-sm font-medium">Address:</span>
                    <div className="col-span-2">
                      <p>{user.kyc.address.line1}</p>
                      {user.kyc.address.line2 && (
                        <p>{user.kyc.address.line2}</p>
                      )}
                      <p>{user.kyc.address.street}</p>
                      <p>
                        {user.kyc.address.city}, {user.kyc.address.state}
                      </p>
                      <p>
                        {user.kyc.address.country} - {user.kyc.address.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No KYC information available
              </p>
            )}
          </div>
        </div>

        {/* Accounts Information */}
        {user.accounts && user.accounts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Accounts</h3>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-4 text-left">Account Number</th>
                    <th className="py-2 px-4 text-left">Type</th>
                    <th className="py-2 px-4 text-right">Balance</th>
                    <th className="py-2 px-4 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {user.accounts.map((account, index) => (
                    <tr
                      key={account.id}
                      className={
                        index !== user.accounts!.length - 1 ? "border-b" : ""
                      }
                    >
                      <td className="py-2 px-4">{account.accountNumber}</td>
                      <td className="py-2 px-4">{account.type}</td>
                      <td className="py-2 px-4 text-right">
                        {formatIndianCurrency(account.balance)}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
