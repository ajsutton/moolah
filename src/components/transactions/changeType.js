export default function changeTypePatch(transaction, value, accounts) {
    const patch = {
        type: value,
    };
    if (transaction.type === 'income' || value === 'income') {
        patch.amount = transaction.amount * -1;
    }
    if (value !== 'transfer') {
        patch.toAccountId = null;
    } else {
        patch.toAccountId = accounts.find(
            account => account.id !== transaction.accountId
        ).id;
    }
    return {
        id: transaction.id,
        patch: patch,
    };
}
