import dateFormat from 'date-fns/format';

export function formatDate(date) {
    return dateFormat(date, 'YYYY-MM-DD');
}
