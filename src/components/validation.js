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

export const rules = {
    amount: [
        maxDecimalPlaces(2)
    ],
};

export function isValid(value, rules) {
    return rules.every(rule => rule(value) === true);   
};