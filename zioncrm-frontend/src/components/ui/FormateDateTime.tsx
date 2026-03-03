import React from 'react'

export default function FormateDateTime(props: any) {
    
    const formatDateTime = (inputDate: string): string => {
         if (inputDate == undefined || inputDate == null) {
            return "";
        }
        // const targetDate = new Date(inputDate);
        let targetDate = new Date(inputDate + "Z");
        let dateParts = targetDate.toLocaleString("en-GB", {
            timeZone: "America/Sao_Paulo", // GMT-3 (Brazil time, handles DST automatically)
            }).split('/')
        // let dateParts = targetDate.toLocaleString("pt-BR").split('/')
        let day = dateParts[0];
        let month = dateParts[1];
        let year_tmp = dateParts[2];
        let year = null;
        let time = "";

        if (year_tmp.indexOf(",") > 0) {
            year = year_tmp.split(",")[0];
            time = year_tmp.split(",")[1];
            time = time.replace(" ", "");
        } else {
            year = year_tmp;
        }
        // console.log(`${day}/${month}/${year}`)
        return `${day}/${month}/${year} ${time}`;
    };
    return (
            formatDateTime(props)
    )
}