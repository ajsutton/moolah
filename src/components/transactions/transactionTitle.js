export function transactionTitle(transaction, getAccountName, getEarmarkName) {
    if (!transaction.accountId && transaction.earmark) {
        return 'Earmark funds for ' + getEarmarkName(transaction.earmark);
    } else if (transaction.type === 'openingBalance') {
        return 'Opening balance';
    } else if (transaction.type === 'transfer') {
        const inverted = transaction.amount >= 0;
        let transferDescription;
        if (transaction.recurPeriod) {
            const toAccountName = inverted ? getAccountName(transaction.accountId) : getAccountName(transaction.toAccountId);
            const fromAccountName = inverted ? getAccountName(transaction.toAccountId) : getAccountName(transaction.accountId);
            transferDescription = `Transfer from ${fromAccountName} to ${toAccountName}`;
        } else {
            const toAccountName = getAccountName(transaction.toAccountId);
            const direction = inverted ? 'from' : 'to';
            transferDescription = `Transfer ${direction} ${toAccountName}`;
        }
        return transaction.payee ? `${transaction.payee} (${transferDescription})` : transferDescription;
    } else {
        return transaction.payee || '\xa0';
    }
}
