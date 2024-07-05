import debounce from 'debounce';
import { isValid } from '../validation';

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
        set(value) {
            this.raw[propertyName] = value;
            if (this.senders[propertyName] == undefined) {
                this.senders[propertyName] = debounce(async () => {
                    const value = this.raw[propertyName];
                    if (
                        value !== undefined &&
                        isValid(value, this.rules[propertyName])
                    ) {
                        await this.updateTransaction({
                            id: this.transaction.id,
                            patch: {
                                [propertyName]: fromDisplay(
                                    value,
                                    this.transaction
                                ),
                            },
                        });
                        this.raw[propertyName] = undefined;
                    }
                }, 500);
            }
            this.senders[propertyName]();
        },
    };
}

export function onBlur(property) {
    if (this.senders[property] !== undefined) {
        this.senders[property].flush();
    }
}
