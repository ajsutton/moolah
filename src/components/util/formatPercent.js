export default function formatPercent(amount) {
    return (
        amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }) + '%'
    );
}
