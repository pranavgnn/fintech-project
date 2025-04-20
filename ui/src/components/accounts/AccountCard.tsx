import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, ArrowUpDown, Landmark } from "lucide-react";
import { formatIndianCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
}

interface AccountCardProps {
  account: Account;
  onViewTransactions: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onViewTransactions,
}) => {
  // Format account number to show only last 4 digits
  const formattedAccountNumber = `•••• ${account.accountNumber.slice(-4)}`;

  // Get appropriate icon based on account type
  const getTypeIcon = () => {
    switch (account.type) {
      case "SAVINGS":
        return <Landmark className="h-12 w-12 text-blue-500" />;
      case "CHECKING":
        return <CreditCard className="h-12 w-12 text-green-500" />;
      case "FIXED_DEPOSIT":
        return <Landmark className="h-12 w-12 text-purple-500" />;
      default:
        return <CreditCard className="h-12 w-12 text-primary" />;
    }
  };

  // Format account type for display
  const formatAccountType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        account.balance < 1000 && "border-amber-500/50"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{formatAccountType(account.type)} Account</CardTitle>
            <CardDescription>{formattedAccountNumber}</CardDescription>
          </div>
          {getTypeIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-1">
          <div className="text-2xl font-bold">
            {formatIndianCurrency(account.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Account Number: {account.accountNumber}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onViewTransactions}>
          <Eye className="h-4 w-4 mr-2" />
          Transactions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/transfer")}
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
