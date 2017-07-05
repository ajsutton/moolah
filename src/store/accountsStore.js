import {setAccounts} from './mutations';
import {loadAccountsAction, createAccountAction} from './actions';
import client from '../api/client';

export default {
    namespaced: true,
    state: {
        accounts: [],
    },
    getters: {
        networth(state) {
            return state.accounts.reduce((networth, account) => networth + account.balance, 0);
        },
    },
    mutations: {
        [setAccounts](state, accounts) {
            state.accounts = accounts;
        },
    },
    actions: {
        async [loadAccountsAction]({commit}) {
            const response = await client.accounts();
            commit(setAccounts, response.accounts);
        },

        async [createAccountAction]({commit, state}, account) {
            const originalAccounts = state.accounts;
            commit(setAccounts, [account].concat(state.accounts));
            try {
                await client.createAccount(account);
            } catch (error) {
                commit(setAccounts, originalAccounts);
                throw error;
            }
        },
    },
};
