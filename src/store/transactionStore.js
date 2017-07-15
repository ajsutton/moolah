import client from '../api/client';
import updateBalance from './updateBalance';
import format from 'date-fns/format'
import search from 'binary-search';

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
    deleteTransaction: 'DELETE_TRANSACTION',
};
export const mutations = {
    setTransactions: 'SET_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
    removeTransaction: 'REMOVE_TRANSACTION',
};

const findTransaction = (state, transactionId) => {
    return state.transactions.find(transaction => transaction.id === transactionId);
};

const findTransactionIndex = (state, transactionId) => state.transactions.findIndex(transaction => transaction.id === transactionId);
const transactionComparator = (transaction1, transaction2) => {
    if (transaction1.date < transaction2.date) {
        return 1;
    } else if (transaction1.date > transaction2.date) {
        return -1;
    } else if (transaction1.id < transaction2.id) {
        return -1;
    } else if (transaction1.id > transaction2.id) {
        return 1;
    } else {
        return 0;
    }
};

const findInsertIndex = (state, transaction) => {
    let insertIndex = search(state.transactions, transaction, transactionComparator);
    if (insertIndex < 0) {
        insertIndex = -insertIndex - 1;
    }
    return insertIndex;
};

export function ensureAllFieldsPresent(transaction) {
    ['amount', 'date', 'notes', 'payee', 'accountId', 'type', 'balance'].forEach(key => {
        if (!transaction.hasOwnProperty(key)) {
            transaction[key] = undefined;
        }
    });
    return transaction;
}

export default {
    namespaced: true,
    state: {
        transactions: [],
        priorBalance: 0,
    },
    getters: {
        selectedTransaction(state, getters, rootState) {
            return findTransaction(state, rootState.selectedTransactionId);
        },
    },
    mutations: {
        [mutations.setTransactions](state, transactionsResponse) {
            transactionsResponse.transactions.forEach(ensureAllFieldsPresent);
            updateBalance(transactionsResponse.transactions, undefined, transactionsResponse.priorBalance);
            state.transactions = transactionsResponse.transactions;
            state.priorBalance = transactionsResponse.priorBalance;
        },
        [mutations.addTransaction](state, transaction) {
            const insertIndex = findInsertIndex(state, transaction);
            state.transactions.splice(insertIndex, 0, ensureAllFieldsPresent(transaction));
            updateBalance(state.transactions, insertIndex, state.priorBalance);
        },
        [mutations.removeTransaction](state, transaction) {
            const transactionIndex = state.transactions.findIndex(value => value.id === transaction.id) - 1;
            state.transactions = state.transactions.filter(value => value.id !== transaction.id);
            console.log(transactionIndex);
            updateBalance(state.transactions, transactionIndex, state.priorBalance);
        },
        [mutations.updateTransaction](state, payload) {
            const index = findTransactionIndex(state, payload.id);
            const transaction = state.transactions[index];
            if (transaction !== undefined) {
                if (payload.patch.date !== undefined) {
                    state.transactions.splice(index, 1);
                    Object.assign(transaction, payload.patch);
                    let insertIndex = findInsertIndex(state, transaction);
                    state.transactions.splice(insertIndex, 0, transaction);
                    updateBalance(state.transactions, Math.max(index, insertIndex), state.priorBalance);
                } else if (payload.patch.amount !== undefined) {
                    Object.assign(transaction, payload.patch);
                    updateBalance(state.transactions, index, state.priorBalance);
                } else {
                    Object.assign(transaction, payload.patch);
                }
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
            const initialProperties = {
                amount: 0,
                date: format(new Date(), 'YYYY-MM-DD'),
                notes: '',
                payee: '',
                accountId: rootState.selectedAccountId,
                type: 'expense',
            };
            const transaction = Object.assign({id: 'new-transaction'}, initialProperties);
            commit(mutations.addTransaction, transaction);
            try {
                const serverTransaction = await client.createTransaction(initialProperties);
                commit(mutations.updateTransaction, {id: transaction.id, patch: serverTransaction});
            } catch (error) {
                commit(mutations.removeTransaction, transaction);
                throw error;
            }
        },

        async [actions.updateTransaction]({commit, state}, changes) {
            const transactionId = changes.id;
            const patch = changes.patch;
            const transaction = Object.assign({}, findTransaction(state, transactionId));
            const modifiedTransaction = Object.assign({}, transaction, patch);
            commit(mutations.updateTransaction, changes);
            try {
                await client.updateTransaction(modifiedTransaction);
            } catch (error) {
                commit(mutations.updateTransaction, {id: transactionId, patch: transaction});
                throw error;
            }
        },

        async [actions.deleteTransaction]({commit}, transaction) {
            commit(mutations.removeTransaction, transaction);
            try {
                await client.deleteTransaction(transaction);
            } catch (error) {
                commit(mutations.addTransaction, transaction);
                throw error;
            }
        },
    },
};
