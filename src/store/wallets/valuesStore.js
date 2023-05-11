import client from '../../api/client';
import search from 'binary-search';
import Vue from 'vue';

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

export default {
    namespaced: true,
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
    mutations: {
        [mutations.setValues](state, valuesResponse) {
            state.values = valuesResponse.values;
            state.searchOptions = valuesResponse.searchOptions;
            state.loadingState = valuesResponse.loadingState || IDLE;
            state.hasMore = valuesResponse.hasMore;
            state.totalNumberOfValues = valuesResponse.totalNumberOfValues;
        },
        [mutations.setValue](state, value) {
            const insertIndex = findInsertIndex(state, value);
            if (insertIndex < 0) {
                state.values.splice(-(insertIndex + 1), 0, value);
            } else {
                Vue.set(state.values, insertIndex, value);
            }
        },
        [mutations.removeValue](state, value) {
            const index = findIndex(state, value);
            state.values.splice(index, 1);
        },
    },
    actions: {
        async [actions.loadValues]({ commit }, searchOptions) {
            try {
                commit(mutations.setValues, {
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
                commit(
                    mutations.setValues,
                    Object.assign(response, { searchOptions })
                );
            } catch (error) {
                commit(mutations.setValues, {
                    values: [],
                    loadingState: ERROR,
                    searchOptions,
                });
                throw error;
            }
        },

        async [actions.setValue]({ commit, state }, value) {
            const index = findInsertIndex(state, value);
            const orig = index >= 0 ? state.values[index] : null;
            commit(mutations.setValue, value);
            try {
                await client.accounts.setValue(
                    state.searchOptions.accountId,
                    value
                );
            } catch (error) {
                if (orig !== null) {
                    commit(mutations.updateValue, orig);
                } else {
                    commit(mutations.removeValue, value);
                }
                throw error;
            }
        },

        async [actions.deleteValue]({ commit, state }, value) {
            commit(mutations.removeValue, value);
            try {
                await client.accounts.deleteValue(
                    state.searchOptions.accountId,
                    value.date
                );
            } catch (error) {
                commit(mutations.setValue, value);
                throw error;
            }
        },
    },
};
