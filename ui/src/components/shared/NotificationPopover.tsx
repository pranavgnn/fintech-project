import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface NotificationPopoverProps {
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications = [],
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <h4 className="font-medium">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-border last:border-b-0 ${
                  notification.read ? "" : "bg-accent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{notification.title}</h5>
                  <span className="text-xs text-muted-foreground">
                    {notification.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Bell
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-primary" : "text-primary/80"
                  }`}
                />
              </div>
              <p className="text-muted-foreground font-medium">
                No notifications for now
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you when something arrives
              </p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-center" asChild>
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
