import React, { useMemo } from "react";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  type: string;
}

interface BalanceHistoryChartProps {
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;
}

const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  accounts,
  transactions,
  isLoading,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Theme-aware colors
  const colors = {
    total: isDarkMode ? "#a78bfa" : "#8b5cf6", // purple-400 for dark, purple-500 for light
    savings: isDarkMode ? "#4ade80" : "#22c55e", // green-400 for dark, green-500 for light
    checking: isDarkMode ? "#fbbf24" : "#f59e0b", // amber-400 for dark, amber-500 for light
    grid: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
  };

  const chartData = useMemo(() => {
    if (!accounts.length || !transactions.length) return [];

    const days = 30;
    const today = startOfDay(new Date());

    const currentBalances: { [key: string]: number } = {};
    accounts.forEach((account) => {
      currentBalances[account.accountNumber] = account.balance;
    });

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Generate data points working backward from current balances
    const dataPoints = Array.from({ length: days + 1 }, (_, i) => {
      const date = subDays(today, days - i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "MMM dd"),
        total: 0,
        savings: 0,
        checking: 0,
      };
    });

    // Create a map for quick lookup
    const dataMap = new Map(dataPoints.map((point) => [point.date, point]));

    // Calculate balances for each day
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dataPoint = dataMap.get(dateStr)!;

      // Set initial balances as current balances
      if (i === days) {
        accounts.forEach((account) => {
          if (account.type.includes("SAVING")) {
            dataPoint.savings += account.balance;
          } else {
            dataPoint.checking += account.balance;
          }
        });
        dataPoint.total = dataPoint.savings + dataPoint.checking;
        continue;
      }

      // Get previous day's balances
      const prevDate = format(subDays(date, 1), "yyyy-MM-dd");
      const prevDataPoint = dataMap.get(prevDate)!;

      dataPoint.savings = prevDataPoint.savings;
      dataPoint.checking = prevDataPoint.checking;

      // Apply transactions for this day
      const dayTransactions = sortedTransactions.filter((tx) => {
        const txDate = format(parseISO(tx.timestamp), "yyyy-MM-dd");
        return txDate === dateStr;
      });

      // Update balances based on transactions
      dayTransactions.forEach((tx) => {
        const { fromAccountNumber, toAccountNumber, amount } = tx;

        // Handle internal transfers
        if (fromAccountNumber && toAccountNumber) {
          const fromAccount = accounts.find(
            (a) => a.accountNumber === fromAccountNumber
          );
          const toAccount = accounts.find(
            (a) => a.accountNumber === toAccountNumber
          );

          if (fromAccount && toAccount) {
            if (fromAccount.type.includes("SAVING")) {
              dataPoint.savings -= amount;
            } else {
              dataPoint.checking -= amount;
            }

            if (toAccount.type.includes("SAVING")) {
              dataPoint.savings += amount;
            } else {
              dataPoint.checking += amount;
            }
          }
        }
        // Handle external transfers (only from account exists)
        else if (fromAccountNumber) {
          const fromAccount = accounts.find(
            (a) => a.accountNumber === fromAccountNumber
          );

          if (fromAccount) {
            if (fromAccount.type.includes("SAVING")) {
              dataPoint.savings -= amount;
            } else {
              dataPoint.checking -= amount;
            }
          }
        }
        // Handle incoming transfers (only to account exists)
        else if (toAccountNumber) {
          const toAccount = accounts.find(
            (a) => a.accountNumber === toAccountNumber
          );

          if (toAccount) {
            if (toAccount.type.includes("SAVING")) {
              dataPoint.savings += amount;
            } else {
              dataPoint.checking += amount;
            }
          }
        }
      });

      dataPoint.total = dataPoint.savings + dataPoint.checking;
    }

    return dataPoints;
  }, [accounts, transactions]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">
          No balance history data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: colors.text }}
          interval={Math.floor(chartData.length / 10)}
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
          tick={{ fill: colors.text }}
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(value)
          }
          labelFormatter={(label) => `Date: ${label}`}
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
            color: colors.text,
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Total Balance"
          stroke={colors.total}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="savings"
          name="Savings Accounts"
          stroke={colors.savings}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="checking"
          name="Checking Accounts"
          stroke={colors.checking}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BalanceHistoryChart;
