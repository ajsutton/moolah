import { defineStore } from 'pinia';
import {
    actions as transactionActions,
    useTransactionsStore,
    useScheduledTransactionsStore,
} from '../stores/transactions/transactionStore';
import { useAccountsStore } from './accountsStore';
import { useEarmarksStore } from './earmarksStore';

export const mutations = {
    selectTransaction: 'SELECT_TRANSACTION',
    showEditTransactionPanel: 'SHOW_EDIT_TRANSACTION_PANEL',
    showMainNav: 'SHOW_MAIN_NAV',
};
export const actions = {
    loadTransactions: 'SELECT_ACCOUNT',
    showUpcoming: 'SHOW_UPCOMING',
    selectTransaction: mutations.selectTransaction,
};

export const useRootStore = defineStore('root', {
    state: state => ({
        selectedTransactionId: null,
        selectedScheduledTransaction: false,
        showEditTransactionPanel: false,
        showMainNav: true,
    }),
    getters: {
        selectedTransactionModule(state) {
            return state.selectedScheduledTransaction
                ? useScheduledTransactionsStore()
                : useTransactionsStore();
        },
        selectedTransaction(state) {
            return state.selectedTransactionModule.selectedTransaction;
        },
        availableFunds() {
            return (
                useAccountsStore().currentAccountsBalance -
                useEarmarksStore().totalEarmarked
            );
        },
        totalNetWorth() {
            return (
                useAccountsStore().networth - useEarmarksStore().totalEarmarked
            );
        },
    },
    actions: {
        [actions.loadTransactions](searchOptions) {
            return useTransactionsStore()[transactionActions.loadTransactions](
                searchOptions
            );
        },
        [actions.showUpcoming]() {
            return useScheduledTransactionsStore()[
                transactionActions.loadTransactions
            ]({ account: null, scheduled: true });
        },
        UPDATE_TRANSACTION(value) {
            this.selectedTransactionModule[
                transactionActions.updateTransaction
            ](value);
        },
        DELETE_TRANSACTION(value) {
            this.selectedTransactionModule[
                transactionActions.deleteTransaction
            ](value);
        },

        [mutations.selectTransaction](data) {
            this.selectedTransactionId = data && data.id;
            this.selectedScheduledTransaction = data && data.scheduled;
            this.showEditTransactionPanel = true;
        },
        [mutations.showEditTransactionPanel](newValue) {
            this.showEditTransactionPanel = newValue;
        },
        [mutations.showMainNav](newValue) {
            this.showMainNav = newValue;
        },
    },
});
