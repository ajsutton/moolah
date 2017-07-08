import client from '../api/client';
import updateBalance from './updateBalance';
import moment from 'moment';

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
};
export const mutations = {
    setTransactions: 'SET_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
};

export default {
    namespaced: true,
    state: {
        transactions: [],
    },
    mutations: {
        [mutations.setTransactions](state, transactions) {
            state.transactions = transactions;
            updateBalance(state.transactions);
        },
        [mutations.addTransaction](state, transaction) {
            state.transactions.unshift(transaction);
            updateBalance(state.transactions, 0);
        }

    },
    actions: {
        async [actions.loadTransactions]({commit, rootState}) {
            if (rootState.selectedAccountId === null) {
                commit(mutations.setTransactions, []);
                return;
            }
            const response = await client.transactions(rootState.selectedAccountId);
            const transactions = response.transactions;
            commit(mutations.setTransactions, transactions);
        },

        async [actions.addTransaction]({commit}) {
            const transaction = { id: 'new-transaction', amount: 0, date: moment().format('YYYY-MM-dd')};
            commit(mutations.addTransaction, transaction);
        },
    },
};
