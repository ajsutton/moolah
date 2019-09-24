import format from 'date-fns/format';

export function formatDate(value) {
    return format(new Date(value), 'dd MMM yyyy');
}
