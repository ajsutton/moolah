import { format } from 'date-fns';
import { parseDate } from '../../api/apiFormats';

export function formatDate(value) {
    return format(parseDate(value), 'dd MMM yyyy');
}
