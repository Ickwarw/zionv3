import React from 'react'

export default function FormateCurrency(props: any) {
    
      const formatCurrency = (value: number) => {
        if (Number.isNaN(value)) {
            value = 0;
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
            }).format(value);
        };
    return (
        formatCurrency(props)
    )
}