import * as React from "react"

const LabelH4 = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, value, ...props }, ref) => {
    return (
      <h4 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
        {value}
      </h4>
         
    )
  }
)
LabelH4.displayName = "LabelH4"

export { LabelH4 }
