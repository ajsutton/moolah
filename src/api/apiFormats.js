import dateFormat from 'date-fns/format';

export function formatDate(date) {
    return date === undefined ? undefined : dateFormat(date, 'YYYY-MM-DD');
}
