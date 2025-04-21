import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface TransactionVolumeProps {
  data: {
    month: string;
    incoming: number;
    outgoing: number;
  }[];
  isLoading: boolean;
}

const TransactionVolumeChart: React.FC<TransactionVolumeProps> = ({
  data,
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
          <p className="font-medium mb-1">Month: {label}</p>
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
                  maximumFractionDigits: 0,
                }).format(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No transaction data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="month" tick={{ fill: colors.text }} />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-IN", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            }).format(value)
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
          name="Money In"
          dataKey="incoming"
          fill={colors.inflow}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="Money Out"
          dataKey="outgoing"
          fill={colors.outflow}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionVolumeChart;
