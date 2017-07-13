function parseFloatStrict(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value)) {
      return Number(value);
    }
    return NaN;
}

function validate(result, errorMessage) {
    return result ? true : errorMessage;
}

function maxDecimalPlaces(precision) {
    return value => validate(parseFloatStrict(value).toFixed(precision) == parseFloatStrict(value), `Enter a number wth up to ${precision} decimal places`);
}

function maxLength(length) {
    return value => validate(value === undefined || value.length < length, `Enter less than ${length} characters`);
}

function notEmpty() {
    return value => validate(value === undefined || value.length > 0, 'Required');
}

export const rules = {
    accountName: [
        maxLength(255),
        notEmpty(),
    ],
    payee: [
        maxLength(255)
    ],
    amount: [
        maxDecimalPlaces(2)
    ],
    notes: [
        maxLength(10000)
    ],
};

export function isValid(value, rules) {
    return rules === undefined || rules.every(rule => rule(value) === true);
}
