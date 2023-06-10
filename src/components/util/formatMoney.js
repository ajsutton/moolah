export default function formatMoney(
    amount,
    omitZeroCents = false,
    omitSymbol = false
) {
    const fractionDigts =
        omitZeroCents && Math.round(amount / 100) === amount / 100 ? 0 : 2;
    const symbol = omitSymbol ? '' : '$';
    return (
        symbol +
        (amount / 100).toLocaleString(undefined, {
            minimumFractionDigits: fractionDigts,
            maximumFractionDigits: fractionDigts,
        })
    );
}
