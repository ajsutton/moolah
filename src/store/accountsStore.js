import client from '../api/client';

export const mutations = {
    setAccounts: 'SET_ACCOUNTS',
    addAccount: 'ADD_ACCOUNT',
    removeAccount: 'REMOVE_ACCOUNT',
    setAccountId: 'SET_ACCOUNT_ID',
};

export const actions = {
    loadAccounts: 'LOAD_ACCOUNTS',
    createAccount: 'CREATE_ACCOUNT',
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
        [mutations.setAccountId](state, args) {
            state.accounts.find(account => account.id === args.currentId).id = args.newId;
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
                commit(mutations.setAccountId, {currentId: 'new-account', newId: createdAccount.id});
            } catch (error) {
                commit(mutations.removeAccount, accountToAdd);
                throw error;
            }
        },
    },
};
