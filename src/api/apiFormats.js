import { format as dateFormat } from 'date-fns';
import { getDaysInMonth } from 'date-fns';

export function parseDate(val) {
    if (val instanceof Date) {
        return val;
    }
    // Use an explicit time to avoid timezone issues.
    return new Date(val + 'T00:00');
}

export function formatDate(date) {
    let value;
    if (date === undefined) {
        value = undefined;
    } else {
        value = parseDate(date);
    }
    return date === undefined ? undefined : dateFormat(value, 'yyyy-MM-dd');
}

export function monthAsIsoDate(month, dayOfMonth = 1) {
    const strMonth = String(month);
    const yearPart = strMonth.substring(0, strMonth.length - 2);
    const monthPart = strMonth.substring(strMonth.length - 2);
    const monthStart = new Date(Date.UTC(yearPart, monthPart - 1));
    const daysInMonth = getDaysInMonth(monthStart);
    const dayPart = String(Math.min(dayOfMonth, daysInMonth)).padStart(2, '0');
    return parseDate(yearPart + '-' + monthPart + '-' + dayPart);
}
