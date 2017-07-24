import {isValid} from '../validation';

export function makeModelProperty(propertyName, toDisplay = value => value, fromDisplay = value => value) {
    return {
        get() {
            if (this.raw[propertyName] === undefined) {
                return this.transaction ? toDisplay(this.transaction[propertyName], this.transaction) : undefined;
            } else {
                return this.raw[propertyName];
            }
        },
        set(value) {
            this.raw[propertyName] = value;
            if (isValid(value, this.rules[propertyName])) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: {[propertyName]: fromDisplay(value, this.transaction)},
                });
            }
        },
    };
}

export function onBlur(property) {
    if (isValid(this.raw[property], this.rules[property])) {
        this.raw[property] = undefined;
    }
}
