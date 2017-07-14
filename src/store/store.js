import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './accountsStore';
import transactionsModule from './transactionStore';
import {actions as transactionActions} from './transactionStore';
import BalanceUpdatePlugin from './accountBalanceUpdatePlugin';

Vue.use(Vuex);

export const actions = {
    selectAccount: 'SELECT_ACCOUNT',
};
export const mutations = {
    selectAccount: 'SELECT_ACCOUNT',
    selectTransaction: 'SELECT_TRANSACTION',
};

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        selectedAccountId: null,
        selectedTransactionId: null,
    },
    mutations: {
        [mutations.selectAccount](state, selectedAccountId) {
            state.selectedAccountId = selectedAccountId;
        },
        [mutations.selectTransaction](state, selectedTransactionId) {
            state.selectedTransactionId = selectedTransactionId;
        },
    },
    actions: {
        [actions.selectAccount]({commit, dispatch}, accountId) {
            commit(mutations.selectAccount, accountId);
            dispatch('transactions/' + transactionActions.loadTransactions, accountId);
        },
    },
    modules: {
        accounts: accountsModule,
        transactions: transactionsModule,
    },
    plugins: [BalanceUpdatePlugin],
});

export default store;