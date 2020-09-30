import dateFormat from 'date-fns/format';
import getDaysInMonth from 'date-fns/getDaysInMonth';

export function formatDate(date) {
    var value;
    if (date === undefined) {
        value = undefined;
    } else {
        value = new Date(date);
    }
    return date === undefined ? undefined : dateFormat(value, 'yyyy-MM-dd');
}

export function monthAsIsoDate(month, dayOfMonth = 1) {
    const strMonth = String(month);
    const yearPart = strMonth.substring(0, strMonth.length - 2);
    const monthPart = strMonth.substring(strMonth.length - 2);
    const monthStart = new Date(yearPart, monthPart - 1);
    const daysInMonth = getDaysInMonth(monthStart);
    const dayPart = String(Math.min(dayOfMonth, daysInMonth)).padStart(2, '0');
    return new Date(yearPart + '-' + monthPart + '-' + dayPart);
}
