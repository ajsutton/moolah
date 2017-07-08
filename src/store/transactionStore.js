import client from '../api/client';
import updateBalance from './updateBalance';

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
};
export const mutations = {
    setTransactions: 'SET_TRANSACTIONS',
};

export default {
    namespaced: true,
    state: {
        transactions: [],
    },
    mutations: {
        [mutations.setTransactions](state, transactions) {
            state.transactions = transactions;
        },
    },
    actions: {
        async [actions.loadTransactions]({commit, rootState}) {
            if (rootState.selectedAccountId === null) {
                commit(mutations.setTransactions, []);
                return;
            }
            const response = await client.transactions(rootState.selectedAccountId);
            const transactions = response.transactions;
            updateBalance(transactions);
            commit(mutations.setTransactions, transactions);
        },
    },
};
