import client from '../../api/client';
import updateBalance from './updateBalance';
import search from 'binary-search';
import without from '../../util/without';
import { formatDate } from '../../api/apiFormats';
import nextDueDate from './nextDueDate';
import accountBalanceAdjuster from './accountBalanceAdjuster';
import transactionComparator from './transactionComparator';
import { defineStore } from 'pinia';
import { useRootStore } from '../root';
import { useAccountsStore } from '../accountsStore';

const PAGE_SIZE = 100;

export const actions = {
    loadTransactions: 'LOAD_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION',
    updateTransaction: 'UPDATE_TRANSACTION',
    deleteTransaction: 'DELETE_TRANSACTION',
    payTransaction: 'PAY_TRANSACTION',
};
export const mutations = {
    setTransactions: 'SET_TRANSACTIONS',
    addTransaction: 'ADD_TRANSACTION_MUTATION',
    updateTransaction: 'UPDATE_TRANSACTION_MUTATION',
    removeTransaction: 'REMOVE_TRANSACTION',
};

const findTransaction = (state, transactionId) => {
    return state.transactionsById[transactionId];
};

const findTransactionIndex = (state, transaction) => {
    const insertIndex = search(
        state.transactions,
        transaction,
        reverseScheduledTransactionComparator
    );
    if (insertIndex < 0) {
        throw new Error(`Unknown transaction ${transaction.id}`);
    }
    return insertIndex;
};

const reverseScheduledTransactionComparator = (transaction1, transaction2) => {
    const naturalOrder = transactionComparator(transaction1, transaction2);
    return transaction1.recurPeriod || transaction2.recurPeriod
        ? -naturalOrder
        : naturalOrder;
};

const findInsertIndex = (state, transaction) => {
    let insertIndex = search(
        state.transactions,
        transaction,
        reverseScheduledTransactionComparator
    );
    if (insertIndex < 0) {
        insertIndex = -insertIndex - 1;
    }
    return insertIndex;
};

function affectsBalance(patch) {
    return patch.amount !== undefined;
}

export function ensureAllFieldsPresent(transaction) {
    [
        'amount',
        'date',
        'notes',
        'payee',
        'accountId',
        'type',
        'balance',
        'categoryId',
        'recurPeriod',
        'recurEvery',
        'toAccountId',
        'earmark',
    ].forEach(key => {
        if (!transaction.hasOwnProperty(key)) {
            transaction[key] = undefined;
        }
    });
    return transaction;
}

const IDLE = 'idle';
const LOADING = 'loading';
const ERROR = 'error';
export const loadingStates = { IDLE, LOADING, ERROR };

function isSingleAccount(state) {
    return (
        state &&
        state.searchOptions &&
        state.searchOptions.account !== undefined &&
        state.searchOptions.account !== null
    );
}

const options = {
    state() {
        return {
            transactions: [],
            priorBalance: 0,
            transactionsById: {},
            searchOptions: {
                page: 1,
            },
            loadingState: IDLE,
            hasMore: false,
            totalNumberOfTransactions: 0,
        };
    },
    getters: {
        selectedTransaction(state) {
            const rootState = useRootStore();
            return findTransaction(state, rootState.selectedTransactionId);
        },
        hasNext(state) {
            return state.hasMore;
        },
        hasPrevious(state) {
            return (state.searchOptions.page || 1) > 1;
        },
        numberOfPages(state) {
            return Math.ceil(state.totalNumberOfTransactions / PAGE_SIZE) || 0;
        },
        isFiltered(state) {
            return (
                state.searchOptions.from !== undefined ||
                state.searchOptions.to !== undefined ||
                (state.searchOptions.category !== undefined &&
                    state.searchOptions.category.length > 0)
            );
        },
        loading(state) {
            return state.loadingState === LOADING;
        },
        error(state) {
            return state.loadingState === ERROR;
        },
    },
    actions: {
        [mutations.setTransactions](transactionsResponse) {
            const transactionsById = {};
            transactionsResponse.transactions.forEach(transaction => {
                ensureAllFieldsPresent(transaction);
                transactionsById[transaction.id] = transaction;
            });
            updateBalance(
                transactionsResponse.transactions,
                undefined,
                transactionsResponse.priorBalance,
                !isSingleAccount(transactionsResponse)
            );
            this.transactions = transactionsResponse.transactions;
            this.priorBalance = transactionsResponse.priorBalance;
            this.searchOptions = transactionsResponse.searchOptions;
            this.loadingState = transactionsResponse.loadingState || IDLE;
            this.transactionsById = transactionsById;
            this.hasMore = transactionsResponse.hasMore;
            this.totalNumberOfTransactions =
                transactionsResponse.totalNumberOfTransactions;
        },
        [mutations.addTransaction](transaction) {
            const insertIndex = findInsertIndex(this, transaction);
            this.transactions.splice(
                insertIndex,
                0,
                ensureAllFieldsPresent(transaction)
            );
            updateBalance(
                this.transactions,
                insertIndex,
                this.priorBalance,
                !isSingleAccount(this)
            );
            this.transactionsById[transaction.id] = transaction;
        },
        [mutations.removeTransaction](transaction) {
            const transactionIndex = findTransactionIndex(this, transaction);
            this.transactions.splice(transactionIndex, 1);
            updateBalance(
                this.transactions,
                transactionIndex - 1,
                this.priorBalance,
                !isSingleAccount(this)
            );
            delete this.transactionsById[transaction.id];
        },
        [mutations.updateTransaction](payload) {
            const transaction = findTransaction(this, payload.id);
            if (transaction !== undefined) {
                const index = findTransactionIndex(this, transaction);
                let updateBalanceFrom = -1;
                delete this.transactionsById[transaction.id];
                if (
                    payload.patch.date !== undefined ||
                    payload.patch.id !== undefined
                ) {
                    this.transactions.splice(index, 1);
                }
                Object.assign(transaction, payload.patch);
                this.transactionsById[transaction.id] = transaction;
                if (
                    payload.patch.date !== undefined ||
                    payload.patch.id !== undefined
                ) {
                    const insertIndex = findInsertIndex(this, transaction);
                    this.transactions.splice(insertIndex, 0, transaction);
                    updateBalanceFrom = Math.max(index, insertIndex);
                } else if (affectsBalance(payload.patch)) {
                    updateBalanceFrom = index;
                }
                if (updateBalanceFrom !== -1) {
                    updateBalance(
                        this.transactions,
                        updateBalanceFrom,
                        this.priorBalance,
                        !isSingleAccount(this)
                    );
                }
            } else {
                throw Error(`No transaction with ID ${payload.id}`);
            }
        },
        async [actions.loadTransactions](searchOptions) {
            try {
                this[mutations.setTransactions]({
                    transactions: [],
                    priorBalance: 0,
                    searchOptions,
                    loadingState: LOADING,
                });
                const response = await client.transactions(
                    searchOptions,
                    ((searchOptions.page || 1) - 1) * PAGE_SIZE,
                    PAGE_SIZE
                );
                if (searchOptions.scheduled) {
                    response.transactions = response.transactions.reverse();
                }
                this[mutations.setTransactions](
                    Object.assign(response, { searchOptions })
                );
            } catch (error) {
                this[mutations.setTransactions]({
                    transactions: [],
                    priorBalance: 0,
                    loadingState: ERROR,
                    searchOptions,
                });
                throw error;
            }
        },

        async [actions.addTransaction](attributes = {}) {
            const rootStore = useRootStore();
            const accountsStore = useAccountsStore();
            const account =
                accountsStore.selectedAccount || accountsStore.accounts[0];
            const initialProperties = Object.assign(
                {
                    amount: 0,
                    date: formatDate(new Date()),
                    notes: '',
                    payee: '',
                    accountId: account.id,
                    type: account.type === 'earmark' ? 'income' : 'expense',
                    categoryId: null,
                },
                attributes
            );
            const transaction = Object.assign(
                { id: 'new-transaction' },
                initialProperties
            );
            this[mutations.addTransaction](transaction);
            accountBalanceAdjuster(null, transaction);
            try {
                const serverTransaction =
                    await client.createTransaction(initialProperties);
                this[mutations.updateTransaction]({
                    id: transaction.id,
                    patch: serverTransaction,
                });
                rootStore.SELECT_TRANSACTION({
                    id: serverTransaction.id,
                    scheduled: transaction.recurPeriod !== undefined,
                });
            } catch (error) {
                this[mutations.removeTransaction](transaction);
                accountBalanceAdjuster(transaction, null);
                throw error;
            }
        },

        async [actions.updateTransaction](changes) {
            const transactionId = changes.id;
            const transaction = Object.assign(
                {},
                findTransaction(this, transactionId)
            );
            this[mutations.updateTransaction](changes);
            const modifiedTransaction = findTransaction(this, transactionId);
            accountBalanceAdjuster(transaction, modifiedTransaction);
            try {
                await client.updateTransaction(modifiedTransaction);
            } catch (error) {
                this[mutations.updateTransaction]({
                    id: transactionId,
                    patch: transaction,
                });
                accountBalanceAdjuster(modifiedTransaction, transaction);
                throw error;
            }
        },

        async [actions.deleteTransaction](transaction) {
            this[mutations.removeTransaction](transaction);
            accountBalanceAdjuster(transaction, null);
            try {
                await client.deleteTransaction(transaction);
            } catch (error) {
                this[mutations.addTransaction](transaction);
                accountBalanceAdjuster(null, transaction);
                throw error;
            }
        },

        async [actions.payTransaction](payload) {
            const asyncOperations = [];
            const transaction = findTransaction(this, payload.id);
            const appliedTransaction = without(
                transaction,
                'recurEvery',
                'recurPeriod',
                'balance',
                'id'
            );
            try {
                accountBalanceAdjuster(null, appliedTransaction);
                asyncOperations.push(
                    client.createTransaction(appliedTransaction)
                );
                if (transaction.recurPeriod === 'ONCE') {
                    this[mutations.removeTransaction](transaction);
                    asyncOperations.push(client.deleteTransaction(transaction));
                } else {
                    const nextDate = nextDueDate(transaction);
                    this[mutations.updateTransaction]({
                        id: transaction.id,
                        patch: { date: nextDate },
                    });
                    asyncOperations.push(client.updateTransaction(transaction));
                }
                await Promise.all(asyncOperations);
            } catch (error) {
                this[actions.loadTransactions]({ scheduled: true });
                accountBalanceAdjuster(appliedTransaction, null);
                throw error;
            }
        },
    },
};

export const useTransactionsStore = defineStore('transactions', options);
export const useScheduledTransactionsStore = defineStore(
    'scheduledTransactions',
    options
);
