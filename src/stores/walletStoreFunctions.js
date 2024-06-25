export const walletMutations = {
    set: 'SET',
    add: 'ADD',
    remove: 'REMOVE',
    update: 'UPDATE_MUTATION',
};

export const walletActions = {
    load: 'LOAD',
    create: 'CREATE',
    update: 'UPDATE',
    adjustBalance: 'ADJUST_BALANCE',
    setValue: 'SET_VALUE',
};

export function createWalletStoreActions(
    propertyName,
    client,
    newWalletFilter = wallet => wallet
) {
    return {
        async [walletActions.load]() {
            const response = await client.get();
            this[walletMutations.set](response[propertyName]);
        },

        async [walletActions.create](wallet) {
            const id = 'new-wallet';
            const walletToAdd = newWalletFilter({ id, ...wallet });
            this[walletMutations.add](walletToAdd);
            try {
                const createdAccount = await client.create(wallet);
                this[walletMutations.update]({
                    id: 'new-wallet',
                    patch: { id: createdAccount.id },
                });
            } catch (error) {
                this[walletMutations.remove](walletToAdd);
                throw error;
            }
        },

        async [walletActions.update](changes) {
            const wallet = this[propertyName].find(
                wallet => wallet.id === changes.id
            );
            const originalAccount = Object.assign({}, wallet);
            this[walletMutations.update](changes);
            try {
                await client.update(wallet);
            } catch (error) {
                this[walletMutations.update]({
                    id: changes.id,
                    patch: originalAccount,
                });
                throw error;
            }
        },

        async [walletActions.adjustBalance](changes) {
            const wallet = this[propertyName].find(
                candidate => candidate.id === changes.id
            );
            const patch = { balance: wallet.balance + changes.balance };
            if (changes.saved !== undefined) {
                patch.saved = wallet.saved + changes.saved;
            }
            if (changes.spent !== undefined) {
                patch.spent = wallet.spent + changes.spent;
            }
            if (changes.value !== undefined) {
                patch.spent = wallet.spent + changes.spent;
            }
            this[walletMutations.update]({ id: wallet.id, patch });
        },

        async [walletActions.setValue](changes) {
            const wallet = this[propertyName].find(
                candidate => candidate.id === changes.id
            );
            const patch = { value: changes.value };
            this[walletMutations.update]({ id: wallet.id, patch });
        },

        [walletMutations.set](wallets) {
            this[propertyName] = wallets;
        },
        [walletMutations.add](wallet) {
            this[propertyName].unshift(wallet);
        },
        [walletMutations.remove](wallet) {
            this[propertyName] = this[propertyName].filter(
                existingWallet => existingWallet.id !== wallet.id
            );
        },
        [walletMutations.update](changes) {
            const walletx = this[propertyName].find(
                candidate => candidate.id === changes.id
            );
            Object.assign(walletx, changes.patch);
        },
    };
}
