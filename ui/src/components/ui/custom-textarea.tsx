import React from "react";
import { Textarea } from "./textarea";

// Create a forwardRef wrapper for Textarea
const CustomTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }
>(({ className, ...props }, ref) => {
  return <Textarea ref={ref} className={className} {...props} />;
});
CustomTextarea.displayName = "CustomTextarea";

export { CustomTextarea };
