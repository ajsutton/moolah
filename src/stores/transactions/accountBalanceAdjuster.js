import { actions, useAccountsStore } from '../accountsStore';
import { useEarmarksStore } from '../earmarksStore';

function addChange(changes, accountId, amount, saved = false, spent = false) {
    const change = changes[accountId] || { balance: 0, saved: 0, spent: 0 };
    change.balance += amount;
    if (saved) {
        change.saved += amount;
    }
    if (spent) {
        change.spent += amount;
    }
    changes[accountId] = change;
}

export default function updateAccountBalances(
    originalTransaction,
    modifiedTransaction
) {
    const accountChanges = {};
    const earmarkChanges = {};
    if (originalTransaction && !originalTransaction.recurPeriod) {
        if (originalTransaction.accountId) {
            addChange(
                accountChanges,
                originalTransaction.accountId,
                -originalTransaction.amount
            );
        }
        if (originalTransaction.toAccountId) {
            addChange(
                accountChanges,
                originalTransaction.toAccountId,
                originalTransaction.amount
            );
        }
        if (originalTransaction.earmark) {
            addChange(
                earmarkChanges,
                originalTransaction.earmark,
                -originalTransaction.amount,
                originalTransaction.type === 'income',
                originalTransaction.type === 'expense'
            );
        }
    }
    if (modifiedTransaction && !modifiedTransaction.recurPeriod) {
        if (modifiedTransaction.accountId) {
            addChange(
                accountChanges,
                modifiedTransaction.accountId,
                modifiedTransaction.amount
            );
        }
        if (modifiedTransaction.toAccountId) {
            addChange(
                accountChanges,
                modifiedTransaction.toAccountId,
                -modifiedTransaction.amount
            );
        }
        if (modifiedTransaction.earmark) {
            addChange(
                earmarkChanges,
                modifiedTransaction.earmark,
                modifiedTransaction.amount,
                modifiedTransaction.type === 'income',
                modifiedTransaction.type === 'expense'
            );
        }
    }
    const accountStore = useAccountsStore();
    Object.entries(accountChanges)
        .filter(([accountId, change]) => change.balance !== 0)
        .forEach(([accountId, change]) =>
            accountStore[actions.adjustBalance]({
                id: accountId,
                balance: change.balance,
            })
        );

    const earmarksStore = useEarmarksStore();
    Object.entries(earmarkChanges)
        .filter(
            ([earmarkId, change]) =>
                change.balance !== 0 || change.saved !== 0 || change.spent !== 0
        )
        .forEach(([earmarkId, change]) =>
            earmarksStore[actions.adjustBalance]({
                id: earmarkId,
                balance: change.balance,
                saved: change.saved,
                spent: change.spent,
            })
        );
}
