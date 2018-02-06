export const walletMutations = {
    set: 'SET',
    add: 'ADD',
    remove: 'REMOVE',
    update: 'UPDATE',
};

export const walletActions = {
    load: 'LOAD',
    create: 'CREATE',
    update: 'UPDATE',
    adjustBalance: 'ADJUST_BALANCE',
};

export function createWalletStoreActions(propertyName, client) {
    return {
        async [walletActions.load]({commit}) {
            const response = await client.get();
            commit(walletMutations.set, response.accounts);
        },

        async [walletActions.create]({commit}, account) {
            const id = 'new-account';
            const accountToAdd = {id, ...account};
            commit(walletMutations.add, accountToAdd);
            try {
                const createdAccount = await client.create(account);
                commit(walletMutations.update, {id: 'new-account', patch: {id: createdAccount.id}});
            } catch (error) {
                commit(walletMutations.remove, accountToAdd);
                throw error;
            }
        },

        async [walletActions.update]({commit, state}, changes) {
            const account = state[propertyName].find(account => account.id === changes.id);
            const originalAccount = Object.assign({}, account);
            commit(walletMutations.update, changes);
            try {
                await client.update(account);
            } catch (error) {
                commit(walletMutations.update, {id: changes.id, patch: originalAccount});
                throw error;
            }
        },

        async [walletActions.adjustBalance]({state, commit}, changes) {
            const account = state[propertyName].find(account => account.id === changes.accountId);
            commit(walletMutations.update, {id: account.id, patch: {balance: account.balance + changes.amount}});
        },
    };
}

export function createWalletStoreMutations(propertyName) {
    return {
        [walletMutations.set](state, wallets) {
            state[propertyName] = wallets;
        },
        [walletMutations.add](state, account) {
            state[propertyName].unshift(account);
        },
        [walletMutations.remove](state, account) {
            state[propertyName] = state[propertyName].filter(existingAccount => existingAccount.id !== account.id);
        },
        [walletMutations.update](state, changes) {
            Object.assign(state[propertyName].find(wallet => wallet.id === changes.id), changes.patch);
        },
    };
}
