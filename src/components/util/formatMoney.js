export default function formatMoney(amount) {
    return '$' + (amount / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
};