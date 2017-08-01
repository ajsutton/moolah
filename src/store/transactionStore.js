import client from '../api/client';
import updateBalance from './updateBalance';
import search from 'binary-search';
import Vue from 'vue';
import without from '../util/without';
import {formatDate} from '../api/apiFormats';
import addDays from 'date-fns/add_days';
import addWeeks from 'date-fns/add_weeks';
import addMonths from 'date-fns/add_months';
import addYears from 'date-fns/add_years';
import accountBalanceAdjuster from './accountBalanceAdjuster';

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
    deleteTransaction: 'DELETE_TRANSACTION',
    payTransaction: 'PAY_TRANSACTION',
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
    let insertIndex = search(state.transactions, transaction, reverseScheduledTransactionComparator);
    if (insertIndex < 0) {
        throw new Error(`Unknown transaction ${transaction.id}`);
    }
    return insertIndex;
};

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

const reverseScheduledTransactionComparator = (transaction1, transaction2) => {
    const naturalOrder = transactionComparator(transaction1, transaction2);
    return transaction1.recurPeriod || transaction2.recurPeriod ? -naturalOrder : naturalOrder;
};

const findInsertIndex = (state, transaction) => {
    let insertIndex = search(state.transactions, transaction, reverseScheduledTransactionComparator);
    if (insertIndex < 0) {
        insertIndex = -insertIndex - 1;
    }
    return insertIndex;
};

function affectsBalance(patch) {
    return patch.amount !== undefined;
}

export function ensureAllFieldsPresent(transaction) {
    ['amount', 'date', 'notes', 'payee', 'accountId', 'type', 'balance', 'categoryId', 'recurPeriod', 'recurEvery'].forEach(key => {
        if (!transaction.hasOwnProperty(key)) {
            transaction[key] = undefined;
        }
    });
    return transaction;
}

const dateFunction = period => {
    switch (period) {
        case 'DAY':
            return addDays;
        case 'WEEK':
            return addWeeks;
        case 'MONTH':
            return addMonths;
        case 'YEAR':
            return addYears;
        default:
            throw new Error(`Unknown period: ${period}`);
    }
};

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
            const transactionsById = {};
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
                if (payload.patch.date !== undefined || payload.patch.id !== undefined) {
                    state.transactions.splice(index, 1);
                }
                Object.assign(transaction, payload.patch);
                Vue.set(state.transactionsById, transaction.id, transaction);
                if (payload.patch.date !== undefined || payload.patch.id !== undefined) {
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
            if (searchOptions.scheduled) {
                response.transactions = response.transactions.reverse();
            }
            commit(mutations.setTransactions, response);
        },

        async [actions.addTransaction]({commit, rootState, dispatch}, attributes = {}) {
            const initialProperties = Object.assign({
                amount: 0,
                date: formatDate(new Date()),
                notes: '',
                payee: '',
                accountId: rootState.selectedAccountId || rootState.accounts.accounts[0].id,
                type: 'expense',
                categoryId: null,
            }, attributes);
            const transaction = Object.assign({id: 'new-transaction'}, initialProperties);
            commit(mutations.addTransaction, transaction);
            accountBalanceAdjuster(dispatch, null, transaction);
            try {
                const serverTransaction = await client.createTransaction(initialProperties);
                commit(mutations.updateTransaction, {id: transaction.id, patch: serverTransaction});
                dispatch('SELECT_TRANSACTION', serverTransaction.id, {root: true});
            } catch (error) {
                commit(mutations.removeTransaction, transaction);
                accountBalanceAdjuster(dispatch, transaction, null);
                throw error;
            }
        },

        async [actions.updateTransaction]({commit, state, dispatch}, changes) {
            const transactionId = changes.id;
            const transaction = Object.assign({}, findTransaction(state, transactionId));
            commit(mutations.updateTransaction, changes);
            const modifiedTransaction = findTransaction(state, transactionId);
            accountBalanceAdjuster(dispatch, transaction, modifiedTransaction);
            try {
                await client.updateTransaction(modifiedTransaction);
            } catch (error) {
                commit(mutations.updateTransaction, {id: transactionId, patch: transaction});
                accountBalanceAdjuster(dispatch, modifiedTransaction, transaction);
                throw error;
            }
        },

        async [actions.deleteTransaction]({commit, dispatch}, transaction) {
            commit(mutations.removeTransaction, transaction);
            accountBalanceAdjuster(dispatch, transaction, null);
            try {
                await client.deleteTransaction(transaction);
            } catch (error) {
                commit(mutations.addTransaction, transaction);
                accountBalanceAdjuster(dispatch, null, transaction);
                throw error;
            }
        },

        async [actions.payTransaction]({commit, state, dispatch}, payload) {
            try {
                const asyncOperations = [];
                const transaction = findTransaction(state, payload.id);
                const appliedTransaction = without(transaction, 'recurEvery', 'recurPeriod', 'balance', 'id');
                accountBalanceAdjuster(dispatch, null, appliedTransaction);
                asyncOperations.push(client.createTransaction(appliedTransaction));
                if (transaction.recurPeriod === 'ONCE') {
                    commit(mutations.removeTransaction, transaction);
                    asyncOperations.push(client.deleteTransaction(transaction));
                } else {
                    const nextDate = formatDate(dateFunction(transaction.recurPeriod)(transaction.date, transaction.recurEvery));
                    commit(mutations.updateTransaction, {id: transaction.id, patch: {date: nextDate}});
                    asyncOperations.push(client.updateTransaction(transaction));
                }
                await Promise.all(asyncOperations);
            } catch (error) {
                dispatch(actions.loadTransactions, {scheduled: true});
                accountBalanceAdjuster(dispatch, appliedTransaction, null);
                throw error;
            }
        },
    },
};
