import client from '../../api/client';
import {createWalletStoreActions, createWalletStoreMutations, walletMutations, walletActions} from './walletStoreFunctions';

export {walletMutations as mutations};

export const actions = {
    loadEarmarks: walletActions.load,
    createEarmark: walletActions.create,
    updateEarmark: walletActions.update,
    adjustBalance: walletActions.adjustBalance,
};

export default {
    namespaced: true,
    state: {
        earmarks: [],
    },
    getters: {
        earmark(state) {
            return earmarkId => {
                return state.earmark.find(earmark => earmark.id === earmarkId);
            };
        },
        earmarkName(state, getters) {
            return earmarkId => {
                const earmark = getters.earmark(earmarkId);
                return earmark ? earmark.name : 'Unknown';
            };
        },
        totalEarmarked(state) {
            return state.earmarks.reduce((total, earmark) => total + Math.max(earmark.balance, 0), 0);
        },
    },
    mutations: createWalletStoreMutations('earmarks'),
    actions: createWalletStoreActions('earmarks', client.earmarks),
};
