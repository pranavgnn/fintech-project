import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, Info, XCircle, Clock } from "lucide-react";

interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: "success" | "warning" | "error" | "info";
}

const AdminActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch this data from your API
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setIsLoading(true);
    try {
      // This is where you would fetch real logs from your API
      // For now, we'll generate some simulated activity
      setTimeout(() => {
        // Generate timestamps relative to current time for realism
        const now = new Date();
        const logs: ActivityLog[] = [
          {
            id: "1",
            message: "System started successfully",
            timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
            type: "success",
          },
          {
            id: "2",
            message: "User login: admin@example.com",
            timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
            type: "info",
          },
          {
            id: "3",
            message: "Database connection established",
            timestamp: new Date(now.getTime() - 1 * 60000).toISOString(),
            type: "info",
          },
        ];

        setLogs(logs);
        setIsLoading(false);
      }, 800); // Simulate network delay
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;

      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown time";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col space-y-4 items-center justify-center h-[300px]">
            <Clock className="h-8 w-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Info className="h-8 w-8 mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <div className="mt-1">{getIcon(log.type)}</div>
                  <div>
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityLog;
