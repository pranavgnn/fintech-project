import React from "react";
import {
  LineChart,
  Line,
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

interface UserActivityChartProps {
  data: {
    month: string;
    users: number;
  }[];
  isLoading: boolean;
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({
  data,
  isLoading,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Theme-aware colors
  const colors = {
    line: isDarkMode ? "#a78bfa" : "#8b5cf6", // purple-400 for dark, purple-500 for light
    activeDot: isDarkMode ? "#c4b5fd" : "#a78bfa", // purple-300 for dark, purple-400 for light
    grid: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
  };

  // Custom tooltip
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
                {entry.name}: {entry.value} users
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
        <p className="text-muted-foreground">No user activity data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
        <YAxis tick={{ fill: colors.text }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            color: colors.text,
          }}
        />
        <Line
          type="monotone"
          dataKey="users"
          name="Total Users"
          stroke={colors.line}
          activeDot={{ r: 8, fill: colors.activeDot }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default UserActivityChart;
