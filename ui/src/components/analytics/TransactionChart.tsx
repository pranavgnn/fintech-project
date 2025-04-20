import React, { useMemo } from "react";
import { format, subDays, isAfter, parseISO, startOfDay } from "date-fns";
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
          // Determine if it's an inflow or outflow
          const isOutgoing = transaction.fromAccountNumber !== null;

          if (isOutgoing) {
            dayData.outflow += transaction.amount;
          } else {
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          interval={Math.floor(chartData.length / 7)}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(value)
          }
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Bar
          dataKey="inflow"
          name="Money In"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="outflow"
          name="Money Out"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionChart;
