import client from '../api/client';
import updateBalance from './updateBalance';
import moment from 'moment';
import bs from 'binarysearch';

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

const findTransaction = (state, transactionId)  => {
    return state.transactions.find(transaction => transaction.id === transactionId);
};

const findTransactionIndex = (state, transactionId) => state.transactions.findIndex(transaction => transaction.id === transactionId);
const dateComparator = (transaction1, transaction2) => {
    let result;
    if (transaction1.date < transaction2.date) {
        result = 1;
    } else if (transaction1.date > transaction2.date) {
        result = -1;
    } else {
        result = 0;
    }
    return result;
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
            const insertIndex = bs.insert(state.transactions, ensureAllFieldsPresent(transaction), dateComparator);
            updateBalance(state.transactions, insertIndex, state.priorBalance);
        },
        [mutations.removeTransaction](state, transaction) {
            const transactionIndex = state.transactions.findIndex(value => value.id === transaction.id) - 1;
            state.transactions = state.transactions.filter(value => value.id !== transaction.id);
            updateBalance(state.transactions, transactionIndex, state.priorBalance);
        },
        [mutations.updateTransaction](state, payload) {
            const index = findTransactionIndex(state, payload.id);
            const transaction = state.transactions[index];
            if (transaction !== undefined) {
                Object.assign(transaction, payload.patch);
                if (payload.patch.amount !== undefined) {
                    updateBalance(state.transactions, index, state.priorBalance);
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
                date: moment().format('YYYY-MM-DD'),
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
    },
};
