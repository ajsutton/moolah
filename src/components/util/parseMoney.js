let separator = ',';
let decimal = '.';
const parts = Intl.NumberFormat().formatToParts(1000.1);
for (let i = 0; i < parts.length; i++) {
    if (parts[i].type === 'group') {
        separator = parts[i].value;
    }
    if (parts[i].type == 'decimal') {
        decimal = parts[i].value;
    }
}

const validPattern = new RegExp(
    `^(-|\\+)?([0-9\\${separator}]+(\\${decimal}[0-9]+)?)$`
);

export default function parseMoney(input) {
    if (!validPattern.test(input)) {
        return NaN;
    }
    const value = (input + '').replace(new RegExp(separator, 'g'), '');
    return Math.round(parseFloat(value) * 100);
}
