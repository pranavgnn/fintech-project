import React from "react";
import { Button } from "./button";

// Create a forwardRef wrapper for Button
const CustomButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant, size, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={className}
      variant={variant}
      size={size}
      {...props}
    />
  );
});
CustomButton.displayName = "CustomButton";

export { CustomButton };
