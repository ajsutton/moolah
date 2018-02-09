import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './wallets/accountsStore';
import earmarksModule from './wallets/earmarksStore';
import transactionsModule, {actions as transactionActions} from './transactions/transactionStore';
import categoryModule from './categoryStore';

Vue.use(Vuex);

export const actions = {
    selectAccount: 'SELECT_ACCOUNT',
    showUpcoming: 'SHOW_UPCOMING',
    selectTransaction: 'SELECT_TRANSACTION',
};
export const mutations = {
    selectAccount: 'SELECT_ACCOUNT',
    selectTransaction: 'SELECT_TRANSACTION',
    showEditTransactionPanel: 'SHOW_EDIT_TRANSACTION_PANEL',
    showMainNav: 'SHOW_MAIN_NAV',
};

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        selectedAccountId: null,
        selectedTransactionId: null,
        selectedScheduledTransaction: false,
        showEditTransactionPanel: false,
        showMainNav: true,
    },
    getters: {
        selectedTransactionModule(state, getters) {
            return state.selectedScheduledTransaction ? 'scheduledTransactions' : 'transactions'
        },
        selectedTransaction(state, getters) {
            const module = getters.selectedTransactionModule;
            return getters[`${module}/selectedTransaction`];
        },
        availableFunds(state, getters) {
            return getters['accounts/networth'] - getters['earmarks/totalEarmarked'];
        },
    },
    mutations: {
        [mutations.selectAccount](state, selectedAccountId) {
            state.selectedWalletId = selectedAccountId;
        },
        [mutations.selectTransaction](state, data) {
            state.selectedTransactionId = data && data.id;
            state.selectedScheduledTransaction = data && data.scheduled;
            state.showEditTransactionPanel = true;
        },
        [mutations.showEditTransactionPanel](state, newValue) {
            state.showEditTransactionPanel = newValue;
        },
        [mutations.showMainNav](state, newValue) {
            state.showMainNav = newValue;
        },
    },
    actions: {
        [actions.selectAccount]({commit, dispatch}, searchOptions) {
            commit(mutations.selectAccount, searchOptions.account);
            return dispatch('transactions/' + transactionActions.loadTransactions, searchOptions);
        },
        [actions.showUpcoming]({commit, dispatch}) {
            commit(mutations.selectAccount, null);
            dispatch('scheduledTransactions/' + transactionActions.loadTransactions, {account: null, scheduled: true});
        },
        [actions.selectTransaction]({commit}, data) {
            commit(mutations.selectTransaction, data);
        },
        [transactionActions.updateTransaction]({dispatch, getters}, value) {
            dispatch(getters.selectedTransactionModule + '/' + transactionActions.updateTransaction, value)
        },
        [transactionActions.deleteTransaction]({dispatch, getters}, value) {
            dispatch(getters.selectedTransactionModule + '/' + transactionActions.deleteTransaction, value)
        },
    },
    modules: {
        accounts: accountsModule,
        earmarks: earmarksModule,
        transactions: transactionsModule,
        scheduledTransactions: transactionsModule,
        categories: categoryModule,
    },
});

export default store;
