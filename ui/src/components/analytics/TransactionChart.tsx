import React, { useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  timestamp: string;
  status: string;
  description: string;
}

interface TransactionChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionChart: React.FC<TransactionChartProps> = ({
  transactions,
  isLoading,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Theme-aware colors
  const colors = {
    inflow: isDarkMode ? "#4ade80" : "#22c55e", // green-400 for dark, green-500 for light
    outflow: isDarkMode ? "#f87171" : "#ef4444", // red-400 for dark, red-500 for light
    grid: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
  };

  // Custom tooltip component using shadcn variables
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            "rounded-md border p-3 shadow-md",
            "bg-background/95 text-foreground",
            "border-border"
          )}
        >
          <p className="font-medium mb-1">Date: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm flex items-center gap-2 py-1"
            >
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">
                {entry.name}:{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    // Generate dates for the last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "MMM dd"),
        inflow: 0,
        outflow: 0,
      };
    }).reverse();

    const datesMap = new Map(days.map((day) => [day.date, { ...day }]));

    // Process transactions
    transactions.forEach((transaction) => {
      try {
        const txDate = format(parseISO(transaction.timestamp), "yyyy-MM-dd");
        const dayData = datesMap.get(txDate);

        if (dayData) {
          // Fix the logic to correctly identify inflows and outflows based on the account numbers
          // An inflow is when money is coming INTO one of your accounts (toAccountNumber matches)
          // An outflow is when money is going OUT OF one of your accounts (fromAccountNumber matches)
          if (transaction.fromAccountNumber && !transaction.toAccountNumber) {
            // Pure outflow (e.g., payment)
            dayData.outflow += transaction.amount;
          } else if (
            !transaction.fromAccountNumber &&
            transaction.toAccountNumber
          ) {
            // Pure inflow (e.g., deposit)
            dayData.inflow += transaction.amount;
          } else if (
            transaction.fromAccountNumber &&
            transaction.toAccountNumber
          ) {
            // Transfer between accounts - track both inflow and outflow correctly
            dayData.outflow += transaction.amount;
            dayData.inflow += transaction.amount;
          }
        }
      } catch (err) {
        console.error("Error processing transaction:", err);
      }
    });

    return Array.from(datesMap.values());
  }, [transactions]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No transaction data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: colors.text }}
          interval={Math.floor(chartData.length / 7)}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            })
              .format(value)
              .replace("T", "k")
          }
          tick={{ fill: colors.text }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            fill: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          }}
        />
        <Legend
          wrapperStyle={{
            color: colors.text,
          }}
        />
        <Bar
          dataKey="inflow"
          name="Money In"
          fill={colors.inflow}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="outflow"
          name="Money Out"
          fill={colors.outflow}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionChart;
