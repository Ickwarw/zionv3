import React from 'react'

export default function FormateHour(props: any) {
    
    function formatTimeOrDateTime(dateInput: Date | string): string {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        const today = new Date();
        const isSameDay =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        const pad = (num: number) => String(num).padStart(2, '0');

        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        if (isSameDay) {
            return `${hours}:${minutes}`;
        } else {
            const day = pad(date.getDate());
            const month = pad(date.getMonth() + 1);
            return `${day}/${month} ${hours}:${minutes}`;
        }
    }
    return (
        formatTimeOrDateTime(props)
    )
}