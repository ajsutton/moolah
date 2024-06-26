import client from '../api/client';
import { defineStore } from 'pinia';
import {
    createWalletStoreActions,
    walletActions,
    walletMutations,
} from './walletStoreFunctions';
import { useRootStore } from './root';

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
    setValue: walletActions.setValue,
};

export function accountValue(account) {
    if (account.value !== undefined && account.type === 'investment') {
        return account.value;
    }
    return account.balance;
}

const currentAccountTypes = ['bank', 'asset', 'cc'];
const noncurrentAccountTypes = ['investment'];

function accountsByType(state, types) {
    return state.accounts.filter(account => types.includes(account.type));
}

export const useAccountsStore = defineStore('acconts', {
    state: state => ({
        accounts: [],
    }),
    getters: {
        currentAccounts(state) {
            return accountsByType(state, currentAccountTypes);
        },
        noncurrentAccounts(state) {
            return accountsByType(state, noncurrentAccountTypes);
        },
        account(state) {
            return accountId => {
                return state.accounts.find(account => account.id === accountId);
            };
        },
        accountName(state) {
            return accountId => {
                const account = this.account(accountId);
                return account ? account.name : 'Unknown';
            };
        },
        selectedAccount(state) {
            const rootState = useRootStore();
            return state.accounts.find(
                account => account.id === rootState.selectedWalletId
            );
        },
        currentAccountsBalance(state) {
            return accountsByType(state, currentAccountTypes).reduce(
                (networth, account) => networth + account.balance,
                0
            );
        },
        noncurrentAccountsBalance(state) {
            return accountsByType(state, noncurrentAccountTypes).reduce(
                (networth, account) => networth + account.balance,
                0
            );
        },
        networth(state) {
            return state.accounts.reduce(
                (networth, account) => networth + accountValue(account),
                0
            );
        },
    },
    actions: createWalletStoreActions('accounts', client.accounts),
});
