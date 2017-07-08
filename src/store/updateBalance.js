export default function updateBalances(transactions, updateFrom)
{
    let start;
    let balance;
    if (updateFrom === undefined) {
        start = transactions.length - 1;
        balance = 0;
    } else {
        start = updateFrom;
        balance = transactions[start + 1].balance;
    }
    for (let i = start; i >= 0; i--) {
        balance += transactions[i].amount;
        transactions[i].balance = balance;
    }
}
