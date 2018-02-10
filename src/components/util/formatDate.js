import format from 'date-fns/format';

export function formatDate(value) {
    return format(value, 'DD MMM YYYY');
}
