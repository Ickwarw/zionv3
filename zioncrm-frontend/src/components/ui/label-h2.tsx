import * as React from "react"

const LabelH2 = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, value, ...props }, ref) => {
    return (
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
        {value}
      </h2>
         
    )
  }
)
LabelH2.displayName = "LabelH2"

export { LabelH2 }
