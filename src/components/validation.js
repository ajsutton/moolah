import parseMoney from './util/parseMoney';

function parseFloatStrict(value) {
    if (/^(-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value)) {
        return Number(value);
    }
    return NaN;
}

function validate(result, errorMessage) {
    return result ? true : errorMessage;
}

function money() {
    return value => {
        const parsed = parseMoney(value);
        return validate(
            !isNaN(parsed) && parsed == Math.round(parsed),
            'Enter a number with up to 2 decimal places'
        );
    };
}

function positiveInteger() {
    return value =>
        validate(
            parseFloatStrict(value).toFixed(0) == parseFloatStrict(value) &&
                value > 0,
            `Enter a number above 0`
        );
}

function maxLength(length) {
    return value =>
        validate(
            value === undefined || value === null || value.length < length,
            `Enter less than ${length} characters`
        );
}

function notEmpty() {
    return value =>
        validate(
            value === undefined || value === null || value.length > 0,
            'Required'
        );
}

export const rules = {
    walletName: [maxLength(255), notEmpty()],
    payee: [maxLength(255)],
    amount: [money()],
    notes: [maxLength(10000)],
    recurEvery: [positiveInteger()],
    savingsTarget: [money()],
};

export function isValid(value, rules) {
    return rules === undefined || rules.every(rule => rule(value) === true);
}
