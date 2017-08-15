export default function updateBalances(transactions, updateFrom, priorBalance = 0, ignoreTransfers = false)
{
    let start;
    let balance;
    if (updateFrom === undefined) {
        start = transactions.length - 1;
        balance = priorBalance;
    } else {
        start = updateFrom;
        balance = start + 1 < transactions.length ? transactions[start + 1].balance : priorBalance;
    }
    for (let i = start; i >= 0; i--) {
        const transaction = transactions[i];
        if (!ignoreTransfers || transaction.type !== 'transfer') {
            balance += transaction.amount;
        }
        transaction.balance = balance;
    }
}
