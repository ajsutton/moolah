import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './accountsStore';
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
};

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        selectedAccountId: null,
        selectedTransactionId: null,
        selectedScheduledTransaction: false,
        showEditTransactionPanel: false,
    },
    getters: {
        selectedTransactionModule(state, getters) {
            return state.selectedScheduledTransaction ? 'scheduledTransactions' : 'transactions'
        },
        selectedTransaction(state, getters) {
            const module = getters.selectedTransactionModule;
            return getters[`${module}/selectedTransaction`];
        },
    },
    mutations: {
        [mutations.selectAccount](state, selectedAccountId) {
            state.selectedAccountId = selectedAccountId;
        },
        [mutations.selectTransaction](state, data) {
            state.selectedTransactionId = data && data.id;
            state.selectedScheduledTransaction = data && data.scheduled;
            state.showEditTransactionPanel = true;
        },
        [mutations.showEditTransactionPanel](state, newValue) {
            state.showEditTransactionPanel = newValue;
        },
    },
    actions: {
        [actions.selectAccount]({commit, dispatch}, accountId) {
            commit(mutations.selectAccount, accountId);
            return dispatch('transactions/' + transactionActions.loadTransactions, {account: accountId, scheduled: false});
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
        transactions: transactionsModule,
        scheduledTransactions: transactionsModule,
        categories: categoryModule,
    },
});

export default store;
