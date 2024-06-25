import client from '../api/client';
import search from 'binary-search';
import Vue from 'vue';
import useAccountsStore, { actions as accountActions } from './accountsStore';
import { defineStore } from 'pinia';

const PAGE_SIZE = 100;

export const actions = {
    loadValues: 'LOAD_VALUES',
    setValue: 'SET_VALUE',
    deleteValue: 'DELETE_VALUE',
};
export const mutations = {
    setValues: 'SET_VALUES',
    setValue: 'SET_VALUE',
    removeValue: 'REMOVE_VALUE',
};

const valueComparator = (v1, v2) => {
    if (v1.date < v2.date) {
        return 1;
    } else if (v1.date > v2.date) {
        return -1;
    } else {
        return 0;
    }
};

const findIndex = (state, value) => {
    const insertIndex = search(state.values, value, valueComparator);
    if (insertIndex < 0) {
        throw new Error(`Unknown value ${value.date}`);
    }
    return insertIndex;
};

const findInsertIndex = (state, value) => {
    return search(state.values, value, valueComparator);
};

const IDLE = 'idle';
const LOADING = 'loading';
const ERROR = 'error';
export const loadingStates = { IDLE, LOADING, ERROR };

export const useValuesStore = defineStore('values', {
    state() {
        return {
            values: [],
            searchOptions: {
                page: 1,
            },
            loadingState: IDLE,
            hasMore: false,
            totalNumberOfValues: 0,
        };
    },
    getters: {
        hasNext(state) {
            return state.hasMore;
        },
        hasPrevious(state) {
            return (state.searchOptions.page || 1) > 1;
        },
        numberOfPages(state) {
            return Math.ceil(state.totalNumberOfValues / PAGE_SIZE) || 0;
        },
        loading(state) {
            return state.loadingState === LOADING;
        },
        error(state) {
            return state.loadingState === ERROR;
        },
    },
    actions: {
        [mutations.setValues](valuesResponse) {
            this.values = valuesResponse.values;
            this.searchOptions = valuesResponse.searchOptions;
            this.loadingState = valuesResponse.loadingState || IDLE;
            this.hasMore = valuesResponse.hasMore;
            this.totalNumberOfValues = valuesResponse.totalNumberOfValues;
        },
        [mutations.setValue](value) {
            const insertIndex = findInsertIndex(this, value);
            if (insertIndex < 0) {
                this.values.splice(-(insertIndex + 1), 0, value);
            } else {
                Vue.set(this.values, insertIndex, value);
            }
        },
        [mutations.removeValue](value) {
            const index = findIndex(this, value);
            this.values.splice(index, 1);
        },

        async [actions.loadValues](searchOptions) {
            try {
                this[mutations.setValues]({
                    values: [],
                    searchOptions,
                    loadingState: LOADING,
                });
                const pageSize = searchOptions.pageSize || PAGE_SIZE;

                const response = await client.accounts.getValues(
                    searchOptions.accountId,
                    ((searchOptions.page || 1) - 1) * pageSize,
                    pageSize
                );
                this[mutations.setValues](
                    Object.assign(response, { searchOptions })
                );
            } catch (error) {
                this[mutations.setValues]({
                    values: [],
                    loadingState: ERROR,
                    searchOptions,
                });
                throw error;
            }
        },

        async [actions.setValue](value) {
            const index = findInsertIndex(this, value);
            const orig = index >= 0 ? this.values[index] : null;
            this[mutations.setValue](value);
            try {
                await client.accounts.setValue(
                    this.searchOptions.accountId,
                    value
                );
                const accountsStore = useAccountsStore();
                accountsStore[accountActions.setValue]({
                    id: this.searchOptions.accountId,
                    value:
                        this.values.length > 0
                            ? this.values[0].value
                            : undefined,
                });
            } catch (error) {
                if (orig !== null) {
                    this[mutations.updateValue](orig);
                } else {
                    this[mutations.removeValue](value);
                }
                throw error;
            }
        },

        async [actions.deleteValue](value) {
            this[mutations.removeValue](value);
            try {
                await client.accounts.deleteValue(
                    this.searchOptions.accountId,
                    value.date
                );
                const accountsStore = useAccountsStore();
                accountsStore[accountActions.setValue]({
                    id: this.searchOptions.accountId,
                    value:
                        this.values.length > 0
                            ? this.values[0].value
                            : undefined,
                });
            } catch (error) {
                this[mutations.setValue](value);
                throw error;
            }
        },
    },
});
