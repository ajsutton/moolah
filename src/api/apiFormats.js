import dateFormat from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

export function formatDate(date) {
    var value;
    if (date === undefined) {
        value = undefined;
    } else if (typeof date == 'string') {
        value = parseISO(date);
    } else {
        value = date;
    }
    return date === undefined ? undefined : dateFormat(value, 'yyyy-MM-dd');
}

export function monthAsIsoDate(month, dayOfMonth = 1) {
    const strMonth = String(month);
    return parseISO(strMonth.substring(0, strMonth.length - 2) + '-' + strMonth.substring(strMonth.length - 2) + '-' + String(dayOfMonth).padStart(2, '0')); 
}