import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-xl border border-black/[0.1] bg-black/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-ink/35",
        "transition focus:border-coral/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
