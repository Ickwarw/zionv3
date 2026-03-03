import React from 'react'

export default function FormateTimeAge(initDate: string, finishDate: string = null) {
    // console.log(props,'tttt')
    // const { inputDate } = props;
    const formatDateAge = (initDate: string, finishDate: string): string => {
        const currentDate = finishDate == null ? new Date() : new Date(finishDate);
        const targetDate = new Date(initDate);
        const timeDifference = currentDate.getTime() - targetDate.getTime();

        const secondsDifference = Math.floor(timeDifference / 1000);
        const minutesDifference = Math.floor(secondsDifference / 60);
        const hoursDifference = Math.floor(minutesDifference / 60);
        const daysDifference = Math.floor(hoursDifference / 24);
        const monthsDifference = Math.floor(daysDifference / 30);

        if (monthsDifference >= 12) {
            const yearsDifference = Math.floor(monthsDifference / 12);
            return `${yearsDifference} ${yearsDifference === 1 ? 'ano' : 'anos'}`;
        } else if (monthsDifference >= 1) {
            return `${monthsDifference} ${monthsDifference === 1 ? 'mês' : 'meses'}`;
        } else if (daysDifference >= 1) {
            return `${daysDifference} ${daysDifference === 1 ? 'dia' : 'dias'}`;
        } else if (hoursDifference >= 1) {
            return `${hoursDifference} ${hoursDifference === 1 ? 'hora' : 'horas'}`;
        } else if (minutesDifference >= 1) {
            return `${minutesDifference} ${minutesDifference === 1 ? 'minuto' : 'minutos'}`;
        } else {
            return `${secondsDifference} ${secondsDifference === 1 ? 'segundo' : 'segundos'}`;
        }
    };
    return (
        <>
            {formatDateAge(initDate, finishDate)}
        </>
    )
}