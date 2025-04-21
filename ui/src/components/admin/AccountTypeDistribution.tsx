import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface AccountTypeDistributionProps {
  data: {
    type: string;
    count: number;
  }[];
  isLoading: boolean;
}

const AccountTypeDistribution: React.FC<AccountTypeDistributionProps> = ({
  data,
  isLoading,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Theme-aware colors
  const COLORS = isDarkMode
    ? ["#60a5fa", "#4ade80", "#c084fc", "#fbbf24"] // blue-400, green-400, purple-400, amber-400
    : ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]; // blue-500, green-500, purple-500, amber-500

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            "rounded-md border p-3 shadow-md",
            "bg-background/95 text-foreground",
            "border-border"
          )}
        >
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm flex items-center gap-2 py-1">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: payload[0].fill }}
            />
            <span className="font-medium">
              {payload[0].value} accounts (
              {(payload[0].percent * 100).toFixed(0)}%)
            </span>
          </p>
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
        <p className="text-muted-foreground">No account data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          fill="#8884d8"
          dataKey="count"
          nameKey="type"
          label={({ type, percent }) =>
            `${type} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            color: isDarkMode ? "#e5e7eb" : "#111827",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AccountTypeDistribution;
