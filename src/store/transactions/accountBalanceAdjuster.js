import {actions} from '../accountsStore';

function addChange(changes, accountId, amount) {
    const currentChange = changes[accountId] || 0;
    changes[accountId] = currentChange + amount;
}
export default function updateAccountBalances(dispatch, originalTransaction, modifiedTransaction) {
    const changes = {};
    if (originalTransaction && !originalTransaction.recurPeriod) {
        addChange(changes, originalTransaction.accountId, -originalTransaction.amount);
        if (originalTransaction.toAccountId) {
            addChange(changes, originalTransaction.toAccountId, originalTransaction.amount);
        }
    }
    if (modifiedTransaction && !modifiedTransaction.recurPeriod) {
        addChange(changes, modifiedTransaction.accountId, modifiedTransaction.amount);
        if (modifiedTransaction.toAccountId) {
            addChange(changes, modifiedTransaction.toAccountId, -modifiedTransaction.amount);
        }
    }
    Object.entries(changes)
        .filter(([accountId, amount]) => amount !== 0)
        .forEach(([accountId, amount]) => dispatch('accounts/' + actions.adjustBalance, {accountId: accountId, amount: amount}, {root: true}));
}
