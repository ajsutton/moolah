import client from '../api/client';
import updateBalance from './updateBalance';
import {actions as accountActions} from './accountsStore';
import format from 'date-fns/format'
import search from 'binary-search';
import Vue from 'vue';

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
    return state.transactionsById[transactionId];
};

const findTransactionIndex = (state, transaction) => {
    let insertIndex = search(state.transactions, transaction, transactionComparator);
    if (insertIndex < 0) {
        throw new Error(`Unknown transaction ${transaction.id}`);
    }
    return insertIndex;
};
    //state.transactions.findIndex(transaction => transaction.id === transactionId);
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

function affectsBalance(patch) {
    return patch.amount !== undefined;
}

export function ensureAllFieldsPresent(transaction) {
    ['amount', 'date', 'notes', 'payee', 'accountId', 'type', 'balance', 'categoryId'].forEach(key => {
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
        transactionsById: {},
    },
    getters: {
        selectedTransaction(state, getters, rootState) {
            return findTransaction(state, rootState.selectedTransactionId);
        },
    },
    mutations: {
        [mutations.setTransactions](state, transactionsResponse) {
            const transactionsById = {}
            transactionsResponse.transactions.forEach(transaction => {
                ensureAllFieldsPresent(transaction);
                transactionsById[transaction.id] = transaction;
            });
            updateBalance(transactionsResponse.transactions, undefined, transactionsResponse.priorBalance);
            state.transactions = transactionsResponse.transactions;
            state.priorBalance = transactionsResponse.priorBalance;
            state.transactionsById = transactionsById;
        },
        [mutations.addTransaction](state, transaction) {
            const insertIndex = findInsertIndex(state, transaction);
            state.transactions.splice(insertIndex, 0, ensureAllFieldsPresent(transaction));
            updateBalance(state.transactions, insertIndex, state.priorBalance);
            Vue.set(state.transactionsById, transaction.id, transaction);
        },
        [mutations.removeTransaction](state, transaction) {
            const transactionIndex = findTransactionIndex(state, transaction);
            state.transactions.splice(transactionIndex, 1);
            updateBalance(state.transactions, transactionIndex - 1, state.priorBalance);
            Vue.delete(state.transactionsById, transaction.id);
        },
        [mutations.updateTransaction](state, payload) {
            const transaction = findTransaction(state, payload.id);
            if (transaction !== undefined) {
                const index = findTransactionIndex(state, transaction);
                let updateBalanceFrom = -1;
                Vue.delete(state.transactionsById, transaction.id);
                if (payload.patch.date !== undefined) {
                    state.transactions.splice(index, 1);
                }
                Object.assign(transaction, payload.patch);
                Vue.set(state.transactionsById, transaction.id, transaction);
                if (payload.patch.date !== undefined) {
                    let insertIndex = findInsertIndex(state, transaction);
                    state.transactions.splice(insertIndex, 0, transaction);
                    updateBalanceFrom = Math.max(index, insertIndex);
                } else if (affectsBalance(payload.patch)) {
                    updateBalanceFrom = index;
                }
                if (updateBalanceFrom !== -1) {
                    updateBalance(state.transactions, updateBalanceFrom, state.priorBalance);
                }
            } else {
                throw Error(`No transaction with ID ${payload.id}`);
            }
        },
    },
    actions: {
        async [actions.loadTransactions]({commit}, searchOptions) {
            commit(mutations.setTransactions, {transactions: [], priorBalance: 0});
            const response = await client.transactions(searchOptions);
            commit(mutations.setTransactions, response);
        },

        async [actions.addTransaction]({commit, rootState}, attributes = {}) {
            const initialProperties = Object.assign({
                amount: 0,
                date: format(new Date(), 'YYYY-MM-DD'),
                notes: '',
                payee: '',
                accountId: rootState.selectedAccountId || rootState.accounts.accounts[0].id,
                type: 'expense',
                categoryId: null,
            }, attributes);
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

        async [actions.updateTransaction]({commit, state, dispatch}, changes) {
            const transactionId = changes.id;
            const transaction = Object.assign({}, findTransaction(state, transactionId));
            commit(mutations.updateTransaction, changes);
            const modifiedTransaction = findTransaction(state, transactionId);
            try {
                await client.updateTransaction(modifiedTransaction);
                if (modifiedTransaction.type === 'transfer' && transaction.type !== 'transfer') {
                    dispatch('accounts/' + accountActions.adjustBalance, {accountId: modifiedTransaction.toAccountId, amount: -modifiedTransaction.amount}, {root: true});
                } else if (modifiedTransaction.type !== 'transfer' && transaction.type === 'transfer') {
                    dispatch('accounts/' + accountActions.adjustBalance, {accountId: transaction.toAccountId, amount: transaction.amount}, {root: true});
                } else if (transaction.type === 'transfer' && changes.patch.toAccountId !== undefined) {
                    dispatch('accounts/' + accountActions.adjustBalance, {accountId: transaction.toAccountId, amount: transaction.amount}, {root: true});
                    dispatch('accounts/' + accountActions.adjustBalance, {accountId: modifiedTransaction.toAccountId, amount: -modifiedTransaction.amount}, {root: true});
                } else if (transaction.type === 'transfer' && changes.patch.amount !== undefined) {
                    dispatch('accounts/' + accountActions.adjustBalance, {accountId: transaction.toAccountId, amount: -(modifiedTransaction.amount - transaction.amount)}, {root: true});
                }
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
