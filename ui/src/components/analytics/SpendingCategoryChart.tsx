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
import { useTheme } from "@/components/theme-provider";

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

const SpendingCategoryChart: React.FC<SpendingCategoryChartProps> = ({
  transactions,
  isLoading,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Theme-aware colors
  const COLORS = isDarkMode
    ? [
        "#60a5fa",
        "#4ade80",
        "#fbbf24",
        "#f87171",
        "#c084fc",
        "#94a3b8",
        "#67e8f9",
        "#fda4af",
      ] // lighter for dark mode
    : [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#64748b",
        "#06b6d4",
        "#f43f5e",
      ]; // darker for light mode

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
          {chartData.map((_, index) => (
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
          contentStyle={{
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            color: isDarkMode ? "#f3f4f6" : "#111827",
          }}
          itemStyle={{
            color: isDarkMode ? "#f3f4f6" : "#111827",
          }}
        />
        <Legend
          wrapperStyle={{
            color: isDarkMode ? "#e5e7eb" : "#111827",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SpendingCategoryChart;
