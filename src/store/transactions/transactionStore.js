import client from '../../api/client';
import updateBalance from './updateBalance';
import search from 'binary-search';
import Vue from 'vue';
import without from '../../util/without';
import {formatDate} from '../../api/apiFormats';
import nextDueDate from './nextDueDate';
import accountBalanceAdjuster from './accountBalanceAdjuster';
import transactionComparator from './transactionComparator';

const PAGE_SIZE = 100;

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
    deleteTransaction: 'DELETE_TRANSACTION',
    payTransaction: 'PAY_TRANSACTION',
    loadPage: 'LOAD_PAGE',
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
    ['amount', 'date', 'notes', 'payee', 'accountId', 'type', 'balance', 'categoryId', 'recurPeriod', 'recurEvery', 'toAccountId'].forEach(key => {
        if (!transaction.hasOwnProperty(key)) {
            transaction[key] = undefined;
        }
    });
    return transaction;
}

const IDLE = "idle";
const LOADING = "loading";
const ERROR = "error";
export const loadingStates = { IDLE, LOADING, ERROR }

function isSingleAccount(state) {
    return state && state.searchOptions && (state.searchOptions.account === undefined || state.searchOptions.account === null);
}

export default {
    namespaced: true,
    state() {
        return {
            transactions: [],
            priorBalance: 0,
            transactionsById: {},
            searchOptions: {},
            loadingState: IDLE,
            pageNumber: 1,
            hasMore: false,
            totalNumberOfTransactions: 0,
        };
    },
    getters: {
        selectedTransaction(state, getters, rootState) {
            return findTransaction(state, rootState.selectedTransactionId);
        },
        hasNext(state) {
            return state.hasMore;
        },
        hasPrevious(state) {
            return state.pageNumber > 0;
        },
        numberOfPages(state) {
            return Math.ceil(state.totalNumberOfTransactions / PAGE_SIZE) || 0;
        },
        isFiltered(state) {
            return state.searchOptions.from !== undefined || state.searchOptions.to !== undefined || 
                   (state.searchOptions.category !== undefined && state.searchOptions.category.length > 0);
        },
        loading(state) {
            return state.loadingState === LOADING;
        },
        error(state) {
            return state.loadingState === ERROR;
        }
    },
    mutations: {
        [mutations.setTransactions](state, transactionsResponse) {
            const transactionsById = {};
            transactionsResponse.transactions.forEach(transaction => {
                ensureAllFieldsPresent(transaction);
                transactionsById[transaction.id] = transaction;
            });
            updateBalance(transactionsResponse.transactions, undefined, transactionsResponse.priorBalance, isSingleAccount(transactionsResponse));
            state.transactions = transactionsResponse.transactions;
            state.priorBalance = transactionsResponse.priorBalance;
            state.searchOptions = transactionsResponse.searchOptions;
            state.loadingState = transactionsResponse.loadingState || IDLE;
            state.transactionsById = transactionsById;
            state.hasMore = transactionsResponse.hasMore;
            state.pageNumber = transactionsResponse.pageNumber;
            state.totalNumberOfTransactions = transactionsResponse.totalNumberOfTransactions;
        },
        [mutations.addTransaction](state, transaction) {
            const insertIndex = findInsertIndex(state, transaction);
            state.transactions.splice(insertIndex, 0, ensureAllFieldsPresent(transaction));
            updateBalance(state.transactions, insertIndex, state.priorBalance, !isSingleAccount(state));
            Vue.set(state.transactionsById, transaction.id, transaction);
        },
        [mutations.removeTransaction](state, transaction) {
            const transactionIndex = findTransactionIndex(state, transaction);
            state.transactions.splice(transactionIndex, 1);
            updateBalance(state.transactions, transactionIndex - 1, state.priorBalance, !isSingleAccount(state));
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
                    updateBalance(state.transactions, updateBalanceFrom, state.priorBalance, !isSingleAccount(state));
                }
            } else {
                throw Error(`No transaction with ID ${payload.id}`);
            }
        },
    },
    actions: {
        async [actions.loadTransactions]({commit}, searchOptions) {
            try {
                commit(mutations.setTransactions, {transactions: [], priorBalance: 0, searchOptions, loadingState: LOADING});
                const response = await client.transactions(searchOptions, 0, PAGE_SIZE);
                if (searchOptions.scheduled) {
                    response.transactions = response.transactions.reverse();
                }
                commit(mutations.setTransactions, Object.assign(response, {pageNumber: 1, searchOptions}));
            } catch (error) {
                commit(mutations.setTransactions, {transactions: [], priorBalance: 0, loadingState: ERROR, searchOptions});
                throw error;
            }
        },

        async [actions.loadPage]({commit, rootState, state}, pageNumber) {
            const transactionOffset = PAGE_SIZE * (pageNumber - 1);
            const response = await client.transactions(state.searchOptions, transactionOffset, PAGE_SIZE);
            commit(mutations.setTransactions, Object.assign(response, {searchOptions: state.searchOptions, pageNumber}));
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
                dispatch('SELECT_TRANSACTION', {id: serverTransaction.id, scheduled: transaction.recurPeriod !== undefined}, {root: true});
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
                    const nextDate = nextDueDate(transaction);
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
