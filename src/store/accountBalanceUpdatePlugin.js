import {mutations as accountsMutations} from './accountsStore';

export default store => store.watch(
    (state) => {
        return state.transactions.transactions.length > 0 ? state.transactions.transactions[0].balance : 0;
    },
    (newValue, oldValue) => {
        store.commit('accounts/' + accountsMutations.updateAccount, {
            id: store.state.selectedAccountId, patch: {balance: newValue}
        });
    });