import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground claro:placeholder:text-muted-foreground placeholder:text-white-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )
        }
        ref={ref}
        {...props}
        onInvalid={handleInvalid}
        onInput={handleInput}
        style={{ 
          color: 'var(--theme-inputtext)',
          backgroundColor: 'var(--theme-inputback)'
        }}
      />
    )
  }
)
Input.displayName = "Input"

const handleInvalid = (event) => {
  event.target.setCustomValidity('Por favor, complete este campo.'); 
};

const handleInput = (e) => {
    e.target.setCustomValidity(""); 
  };

export { Input }
