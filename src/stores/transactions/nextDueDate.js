import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { formatDate, parseDate } from '../../api/apiFormats';

const dateStepFunction = period => {
    switch (period) {
        case 'DAY':
            return addDays;
        case 'WEEK':
            return addWeeks;
        case 'MONTH':
            return addMonths;
        case 'YEAR':
            return addYears;
        default:
            throw new Error(`Unknown period: ${period}`);
    }
};

export default function nextDueDate(transaction) {
    return formatDate(
        dateStepFunction(transaction.recurPeriod)(
            parseDate(transaction.date),
            transaction.recurEvery
        )
    );
}
