import Vuex from 'vuex';
import Vue from 'vue';
import {SET_ACCOUNTS} from './mutations';
import {LOAD_ACCOUNTS, CREATE_ACCOUNT} from './actions';
import client from '@/api/client';
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        accounts: [],
    },
    getters: {
        networth(state) {
            return state.accounts.reduce((networth, account) => networth + account.balance, 0);
        },
    },
    mutations: {
        [SET_ACCOUNTS](state, accounts) {
            state.accounts = accounts;
        },
    },
    actions: {
        async [LOAD_ACCOUNTS]({commit}) {
            const response = await client.accounts();
            commit(SET_ACCOUNTS, response.accounts);
        },

        async [CREATE_ACCOUNT]({commit, state}, account) {
            const originalAccounts = state.accounts;
            commit(SET_ACCOUNTS, [account].concat(state.accounts));
            try {
                await client.createAccount(account);
            } catch (error) {
                commit(SET_ACCOUNTS, originalAccounts);
                throw error;
            }
        },
    },
});
