import { addYears, getYear, isAfter } from 'date-fns';

export function currentFY(refDate) {
    let start = new Date(getYear(refDate) - 1, 6, 1);
    let end = new Date(getYear(refDate), 5, 30);
    if (isAfter(refDate, end)) {
        start = addYears(start, 1);
        end = addYears(end, 1);
    }
    return { start, end };
}

export function previousFY(refDate) {
    const year = currentFY(refDate);
    return { start: addYears(year.start, -1), end: addYears(year.end, -1) };
}
