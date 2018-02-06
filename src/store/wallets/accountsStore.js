import client from '../../api/client';
import {createWalletStoreActions, walletActions, walletMutations, createWalletStoreMutations} from './walletStoreFunctions';

export const mutations = {
    setAccounts: walletMutations.set,
    addAccount: walletMutations.add,
    removeAccount: walletMutations.remove,
    updateAccount: walletMutations.update,
};

export const actions = {
    loadAccounts: walletActions.load,
    createAccount: walletActions.create,
    updateAccount: walletActions.update,
    adjustBalance: walletActions.adjustBalance,
};

export default {
    namespaced: true,
    state: {
        accounts: [],
    },
    getters: {
        account(state) {
            return accountId => {
                return state.accounts.find(account => account.id === accountId);
            };
        },
        accountName(state, getters) {
            return accountId => {
                const account = getters.account(accountId);
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
            return state.accounts.filter(account => account.type === 'earmark');
        },
        networth(state, getters) {
            return getters.networthWithEarmarks - getters.totalEarmarked;
        },
        totalEarmarked(state, getters) {
            return getters.earmarkAccounts
                .reduce((networth, account) => networth + account.balance, 0);
        },
        networthWithEarmarks(state, getters) {
            return getters.standardAccounts
                .reduce((networth, account) => networth + account.balance, 0);
        },
    },
    mutations: createWalletStoreMutations('accounts'),
    actions: createWalletStoreActions('accounts', client.accounts),
};
