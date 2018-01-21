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
    adjustBalance: 'ADJUST_BALANCE',
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
        standardAccounts(state) {
            return state.accounts.filter(account => account.type !== 'earmark');
        },
        earmarkAccounts(state) {
            return state.accounts.filter(account=> account.type === 'earmark');
        },
        networth(state, getters) {
            return getters.standardAccounts
                .reduce((networth, account) => networth + account.balance, 0);
        },
        networthWithEarmarks(state) {
            return state.accounts
                .reduce((networth, account) => networth + account.balance, 0);
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
            const account = state.accounts.find(account => account.id === changes.id);
            const originalAccount = Object.assign({}, account);
            commit(mutations.updateAccount, changes);
            try {
                await client.updateAccount(account);
            } catch (error) {
                commit(mutations.updateAccount, {id: changes.id, patch: originalAccount});
                throw error;
            }
        },

        async [actions.adjustBalance]({state, commit}, changes) {
            const account = state.accounts.find(account => account.id === changes.accountId);
            commit(mutations.updateAccount, {id: account.id, patch: {balance: account.balance + changes.amount}});
        },
    },
};
