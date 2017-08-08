import addDays from 'date-fns/add_days';
import addWeeks from 'date-fns/add_weeks';
import addMonths from 'date-fns/add_months';
import addYears from 'date-fns/add_years';
import {formatDate} from '../../api/apiFormats';

export const dateStepFunction = period => {
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
    return formatDate(dateStepFunction(transaction.recurPeriod)(transaction.date, transaction.recurEvery))
}