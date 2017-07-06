import {setAccounts, addAccount, removeAccount, setAccountId} from './mutations';
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
        [addAccount](state, account) {
            state.accounts.unshift(account);
        },
        [removeAccount](state, account) {
            state.accounts = state.accounts.filter(existingAccount => existingAccount.id !== account.id);
        },
        [setAccountId](state, args) {
            state.accounts.find(account => account.id === args.currentId).id = args.newId;
        },
    },
    actions: {
        async [loadAccountsAction]({commit}) {
            const response = await client.accounts();
            commit(setAccounts, response.accounts);
        },

        async [createAccountAction]({commit}, account) {
            const id = 'newAccount-' + Math.random();
            commit(addAccount, {id, ...account});
            try {
                const createdAccount = await client.createAccount(account);
                commit(setAccountId, {currentId: 'new-account', newId: createdAccount.id});
            } catch (error) {
                commit(removeAccount, account);
                throw error;
            }
        },
    },
};
