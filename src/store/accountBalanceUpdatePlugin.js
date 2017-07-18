import {mutations as accountsMutations} from './accountsStore';

export default store => store.watch(
    (state) => {
        return state.transactions.transactions.length > 0 ? state.transactions.transactions[0].balance : undefined;
    },
    (newValue, oldValue) => {
        if (store.getters["accounts/selectedAccount"] !== undefined && newValue !== undefined) {
            store.commit('accounts/' + accountsMutations.updateAccount, {
                id: store.state.selectedAccountId, patch: {balance: newValue}
            });
        }
    });
