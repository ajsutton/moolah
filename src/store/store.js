import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './accountsStore';
import transactionsModule from './transactionStore';
import categoryModule from './categoryStore';
import {actions as transactionActions} from './transactionStore';
import BalanceUpdatePlugin from './accountBalanceUpdatePlugin';

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
        showEditTransactionPanel: false,
    },
    mutations: {
        [mutations.selectAccount](state, selectedAccountId) {
            state.selectedAccountId = selectedAccountId;
        },
        [mutations.selectTransaction](state, selectedTransactionId) {
            state.selectedTransactionId = selectedTransactionId;
            state.showEditTransactionPanel = true;
        },
        [mutations.showEditTransactionPanel](state, newValue) {
            state.showEditTransactionPanel = newValue;
        },
    },
    actions: {
        [actions.selectAccount]({commit, dispatch}, accountId) {
            commit(mutations.selectAccount, accountId);
            dispatch('transactions/' + transactionActions.loadTransactions, {account: accountId, scheduled: false});
        },
        [actions.showUpcoming]({commit, dispatch}, accountId) {
            commit(mutations.selectAccount, null);
            dispatch('transactions/' + transactionActions.loadTransactions, {account: null, scheduled: true});
        },
        [actions.selectTransaction]({commit}, transactionId) {
            commit(mutations.selectTransaction, transactionId);
        },
    },
    modules: {
        accounts: accountsModule,
        transactions: transactionsModule,
        categories: categoryModule,
    },
    plugins: [BalanceUpdatePlugin],
});

export default store;
