import React from 'react'

export default function FormateDateTimeNoSec(props: any) {
    
    const formatDateTimeNoSec = (inputDate: string): string => {
        if (inputDate == undefined || inputDate == null) {
            return "";
        }
        let targetDate = new Date(inputDate + "Z");
        let dateParts = targetDate.toLocaleString("en-GB", {
            timeZone: "America/Sao_Paulo", // GMT-3 (Brazil time, handles DST automatically)
            }).split('/')
        // console.log(dateParts);
        let day = dateParts[0];
        let month = dateParts[1];
        let year_tmp = dateParts[2];
        let year = null;
        let time = "";
        let hour = "";
        let minute = "";

        if (year_tmp.indexOf(",") > 0) {
            year = year_tmp.split(",")[0];
            time = year_tmp.split(",")[1];
            time = time.replace(" ", "");
            hour = time.split(":")[0];
            minute = time.split(":")[1];
        } else {
            year = year_tmp;
        }
        // console.log(`${day}/${month}/${year}`)
        return `${day}/${month}/${year} ${hour}:${minute}`;
    };
    return (
            formatDateTimeNoSec(props)
    )
}