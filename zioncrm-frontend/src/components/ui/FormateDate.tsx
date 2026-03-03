import React from 'react'

export default function FormateDate(props: any) {
    
    const formatDate = (inputDate: string): string => {
        // const targetDate = new Date(inputDate);
        // let dateParts = targetDate.toLocaleString("pt-BR").split('/')
         if (inputDate == undefined || inputDate == null) {
            return "";
        }
        // const targetDate = new Date(inputDate);
        let targetDate = new Date(inputDate + "Z");
        let dateParts = targetDate.toLocaleString("en-GB", {
            timeZone: "America/Sao_Paulo", // GMT-3 (Brazil time, handles DST automatically)
            }).split('/')
        let day = dateParts[0];
        let month = dateParts[1];
        let year_tmp = dateParts[2];
        let year = null;

        if (year_tmp.indexOf(",") > 0) {
            year = year_tmp.split(",")[0];
        } else {
            year = year_tmp;
        }
        // console.log(`${day}/${month}/${year}`)
        return `${day}/${month}/${year}`;
    };
    return (
        formatDate(props)
    )
}