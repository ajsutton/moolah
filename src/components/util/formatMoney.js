export default function formatMoney(amount, fractionDigits = 2) {
    return '$' + (amount / 100).toLocaleString(undefined, {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits});
};