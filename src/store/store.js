import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './accountsStore';
import transactionsModule from './transactionStore';
import {actions as transactionActions} from './transactionStore';

Vue.use(Vuex);

export const actions = {
    selectAccount: 'SELECT_ACCOUNT',
};
export const mutations = {
    selectAccount: 'SELECT_ACCOUNT',
};

export default new Vuex.Store({
    state: {
        selectedAccountId: null,
    },
    mutations: {
        [mutations.selectAccount](state, selectedAccountId) {
            state.selectedAccountId = selectedAccountId;
        }
    },
    actions: {
        [actions.selectAccount]({commit, dispatch}, accountId) {
            commit(mutations.selectAccount, accountId);
            dispatch('transactions/' + transactionActions.loadTransactions, accountId);
        }
    },
    modules: {
        accounts: accountsModule,
        transactions: transactionsModule,
    },
});
