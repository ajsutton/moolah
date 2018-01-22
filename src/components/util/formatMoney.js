export default function formatMoney(amount, omitZeroCents = false) {
    const fractionDigts = omitZeroCents && Math.round(amount / 100) === amount / 100 ? 0 : 2;
    return '$' + (amount / 100).toLocaleString(undefined, {minimumFractionDigits: fractionDigts, maximumFractionDigits: fractionDigts});
};
