import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils"

export default function CurrencyInput({ value, placeholder, onChange }) {
  const [valueInt, setValueInt] = useState(value);
  const [placeholderInt] = useState(placeholder);

  useEffect(() => {
    if (value instanceof Number)
    setValueInt(formatCurrency(String(value)));
  }, [value]);

  const formatCurrency = (val: string) => {
    // Remove all non-digits
    const numericValue = val.replace(/\D/g, "");
    if (!numericValue) return "";

    // Convert to cents and format
    const number = parseFloat(numericValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueInt(formatCurrency(e.target.value));
    if (onChange != null) {
        onChange(formatCurrency(e.target.value));
    }
  };

  return (
    <input
      type="text"
      value={valueInt}
      onChange={handleChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        )}
      placeholder={placeholderInt}
    />
  );
}

