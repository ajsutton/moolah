import dateFormat from 'date-fns/format';

export function formatDate(date) {
    return date === undefined ? undefined : dateFormat(date, 'YYYY-MM-DD');
}

export function monthAsIsoDate(month, dayOfMonth = 1) {
    const strMonth = String(month);
    return strMonth.substring(0, strMonth.length - 2) + '-' + strMonth.substring(strMonth.length - 2) + '-' + String(dayOfMonth).padStart(2, '0'); 
}