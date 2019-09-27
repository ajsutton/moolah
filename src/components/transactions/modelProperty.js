import { isValid } from '../validation';
import debounce from 'debounce';

export function makeModelProperty(
    propertyName,
    toDisplay = value => value,
    fromDisplay = value => value
) {
    return {
        get() {
            if (this.raw[propertyName] === undefined) {
                return toDisplay(
                    this.transaction[propertyName],
                    this.transaction
                );
            } else {
                return this.raw[propertyName];
            }
        },
        set: debounce(function(value) {
            this.raw[propertyName] = value;
            if (isValid(value, this.rules[propertyName])) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: {
                        [propertyName]: fromDisplay(value, this.transaction),
                    },
                });
            }
        }, 1000),
    };
}

export function onBlur(property) {
    if (isValid(this.raw[property], this.rules[property])) {
        this.raw[property] = undefined;
    }
}
