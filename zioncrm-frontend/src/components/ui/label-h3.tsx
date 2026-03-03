import * as React from "react"

const LabelH3 = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, value, ...props }, ref) => {
    return (
      <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
        {value}
      </h3>
         
    )
  }
)
LabelH3.displayName = "LabelH3"

export { LabelH3 }
