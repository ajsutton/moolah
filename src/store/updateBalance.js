export default function updateBalances(transactions, updateFrom, priorBalance = 0)
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
        balance += transactions[i].amount;
        transactions[i].balance = balance;
    }
}
