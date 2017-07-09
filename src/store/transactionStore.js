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
    removeTransaction: 'REMOVE_TRANSACTION',
};

export default {
    namespaced: true,
    state: {
        transactions: [],
        priorBalance: 0,
    },
    getters: {
        selectedTransaction(state, getters, rootState) {
            return state.transactions.find(transaction => transaction.id === rootState.selectedTransactionId);
        },
    },
    mutations: {
        [mutations.setTransactions](state, transactionsResponse) {
            state.transactions = transactionsResponse.transactions;
            state.priorBalance = transactionsResponse.priorBalance;
            updateBalance(state.transactions, undefined, state.priorBalance);
        },
        [mutations.addTransaction](state, transaction) {
            state.transactions.unshift(transaction);
            updateBalance(state.transactions, 0, state.priorBalance);
        },
        [mutations.removeTransaction](state, transaction) {
            const transactionIndex = state.transactions.findIndex(value => value.id === transaction.id) - 1;
            state.transactions = state.transactions.filter(value => value.id !== transaction.id);
            updateBalance(state.transactions, transactionIndex, state.priorBalance);
        },
        [mutations.updateTransaction](state, payload) {
            const transaction = state.transactions.find(transaction => transaction.id === payload.id);
            if (transaction !== undefined) {
                Object.assign(transaction, payload.patch);
            } else {
                throw Error(`No transaction with ID ${payload.id}`);
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
            commit(mutations.setTransactions, response);
        },

        async [actions.addTransaction]({commit, rootState}) {
            const transaction = {
                id: 'new-transaction',
                payee: null,
                amount: 0,
                date: moment().format('YYYY-MM-dd'),
                notes: '',
                accountId: rootState.selectedAccountId,
                type: 'expense',
            };
            commit(mutations.addTransaction, transaction);
            try {
                const serverTransaction = await client.createTransaction(transaction);
                commit(mutations.updateTransaction, {id: transaction.id, patch: serverTransaction});
            } catch (error) {
                commit(mutations.removeTransaction, transaction);
                throw error;
            }
        },

        async [actions.updateTransaction]({commit}, changes) {
            commit(mutations.updateTransaction, changes);
        },
    },
};
