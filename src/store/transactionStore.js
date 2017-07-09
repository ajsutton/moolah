import client from '../api/client';
import updateBalance from './updateBalance';
import moment from 'moment';

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
};
export const mutations = {
    setTransactions: 'SET_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
};

export default {
    namespaced: true,
    state: {
        transactions: [],
    },
    getters: {
        selectedTransaction(state, getters, rootState) {
            return state.transactions.find(transaction => transaction.id === rootState.selectedTransactionId);
        },
    },
    mutations: {
        [mutations.setTransactions](state, transactions) {
            state.transactions = transactions;
            updateBalance(state.transactions);
        },
        [mutations.addTransaction](state, transaction) {
            state.transactions.unshift(transaction);
            updateBalance(state.transactions, 0);
        },
        [mutations.updateTransaction](state, changes) {
            const transaction = state.transactions.find(transaction => transaction.id === changes.id);
            if (transaction !== undefined) {
                Object.assign(transaction, changes);
            }
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
            commit(mutations.setTransactions, transactions);
        },

        async [actions.addTransaction]({commit}) {
            const transaction = {id: 'new-transaction', payee: null, amount: 0, date: moment().format('YYYY-MM-dd')};
            commit(mutations.addTransaction, transaction);
        },

        async [actions.updateTransaction]({commit}, changes) {
            commit(mutations.updateTransaction, changes)
        },
    },
};
