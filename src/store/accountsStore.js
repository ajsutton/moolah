import client from '../api/client';

export const mutations = {
    setAccounts: 'SET_ACCOUNTS',
    addAccount: 'ADD_ACCOUNT',
    removeAccount: 'REMOVE_ACCOUNT',
    updateAccount: 'UPDATE_ACCOUNT',
};

export const actions = {
    loadAccounts: 'LOAD_ACCOUNTS',
    createAccount: 'CREATE_ACCOUNT',
    updateAccount: 'UPDATE_ACCOUNT',
};

export default {
    namespaced: true,
    state: {
        accounts: [],
    },
    getters: {
        accountName(state) {
            return accountId => {
                const account = state.accounts.find(account => account.id === accountId);
                return account ? account.name : 'Unknown';
            };
        },
        selectedAccount(state, getters, rootState) {
            return state.accounts.find(account => account.id === rootState.selectedAccountId);
        },
        networth(state) {
            return state.accounts.reduce((networth, account) => networth + account.balance, 0);
        },
    },
    mutations: {
        [mutations.setAccounts](state, accounts) {
            state.accounts = accounts;
        },
        [mutations.addAccount](state, account) {
            state.accounts.unshift(account);
        },
        [mutations.removeAccount](state, account) {
            state.accounts = state.accounts.filter(existingAccount => existingAccount.id !== account.id);
        },
        [mutations.updateAccount](state, changes) {
            Object.assign(state.accounts.find(account => account.id === changes.id), changes.patch);
        },
    },
    actions: {
        async [actions.loadAccounts]({commit}) {
            const response = await client.accounts();
            commit(mutations.setAccounts, response.accounts);
        },

        async [actions.createAccount]({commit}, account) {
            const id = 'new-account';
            const accountToAdd = {id, ...account};
            commit(mutations.addAccount, accountToAdd);
            try {
                const createdAccount = await client.createAccount(account);
                commit(mutations.updateAccount, {id: 'new-account', patch: {id: createdAccount.id}});
            } catch (error) {
                commit(mutations.removeAccount, accountToAdd);
                throw error;
            }
        },

        async [actions.updateAccount]({commit, state}, changes) {
            const originalAccount = Object.assign({}, state.accounts.find(account => account.id === changes.id));
            commit(mutations.updateAccount, changes);
            try {
                await client.updateAccount(Object.assign({}, originalAccount, changes.patch));
            } catch (error) {
                commit(mutations.updateAccount, {id: changes.id, patch: originalAccount});
                throw error;
            }
        }
    },
};
