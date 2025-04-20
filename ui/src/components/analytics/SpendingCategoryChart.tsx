import React, { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  timestamp: string;
  status: string;
  description: string;
}

interface SpendingCategoryChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

// Function to extract categories from transaction descriptions
const getCategoryFromDescription = (description: string): string => {
  description = description.toLowerCase();

  if (description.includes("grocery") || description.includes("supermarket")) {
    return "Groceries";
  } else if (
    description.includes("restaurant") ||
    description.includes("food") ||
    description.includes("dinner")
  ) {
    return "Dining";
  } else if (description.includes("transfer")) {
    return "Transfers";
  } else if (description.includes("bill") || description.includes("utility")) {
    return "Bills";
  } else if (
    description.includes("transport") ||
    description.includes("uber") ||
    description.includes("ola")
  ) {
    return "Transportation";
  } else if (
    description.includes("shopping") ||
    description.includes("amazon") ||
    description.includes("flipkart")
  ) {
    return "Shopping";
  } else if (
    description.includes("entertainment") ||
    description.includes("movie") ||
    description.includes("subscription")
  ) {
    return "Entertainment";
  }

  return "Other";
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6B6B",
  "#4ECDC4",
  "#FFA69E",
  "#2F5D62",
  "#E84855",
];

const SpendingCategoryChart: React.FC<SpendingCategoryChartProps> = ({
  transactions,
  isLoading,
}) => {
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const categories: { [key: string]: number } = {};

    // Process outgoing transactions only
    transactions
      .filter((tx) => tx.fromAccountNumber !== null)
      .forEach((tx) => {
        const category = getCategoryFromDescription(tx.description || "Other");
        categories[category] = (categories[category] || 0) + tx.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No spending data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(value)
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SpendingCategoryChart;
