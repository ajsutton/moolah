import dateFormat from 'date-fns/format';

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
    return new Date(
        strMonth.substring(0, strMonth.length - 2) +
            '-' +
            strMonth.substring(strMonth.length - 2) +
            '-' +
            String(dayOfMonth).padStart(2, '0')
    );
}
