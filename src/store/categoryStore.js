import client from '../api/client';
import search from 'binary-search';
import Vue from 'vue';

export const actions = {
    loadCategories: 'LOAD_CATEGORIES',
    addCategory: 'ADD_CATEGORY',
    updateCategory: 'UPDATE_CATEGORY',
};

export const mutations = {
    addCategory: 'ADD_CATEGORY',
    setCategories: 'SET_CATEGORIES',
    updateCategory: 'UPDATE_CATEGORY',
    removeCategory: 'REMOVE_CATEGORY',
};

const categoryFields = () => ({id: null, name: null, parentId: null, children: []});

const categoryComparator = (category1, category2) => {
    if (category1.name < category2.name) {
        return -1;
    } else if (category1.name > category2.name) {
        return 1;
    } else if (category1.id < category2.id) {
        return -1;
    } else if (category1.id > category2.id) {
        return 1;
    } else {
        return 0;
    }
};

const apiCategory = category => {
    const api = {};
    Object.keys(categoryFields())
        .filter(fieldName => category.hasOwnProperty(fieldName))
        .filter(fieldName => fieldName !== 'children')
        .forEach(fieldName => api[fieldName] = category[fieldName]);
    return api;
};

const ensureAllFieldsPresent = category => {
    Object.entries(categoryFields()).forEach(([field, defaultValue]) => {
        if (!category.hasOwnProperty(field)) {
            category[field] = defaultValue;
        }
    });
    return category;
};

const insertCategory = (categories, categoriesById, category) => {
    const insertInto = category.parentId !== null ? categoriesById[category.parentId].children : categories;
    let insertIndex = search(insertInto, category, categoryComparator);
    if (insertIndex < 0) {
        insertIndex = -insertIndex - 1;
    }
    insertInto.splice(insertIndex, 0, category);
};

export default {
    namespaced: true,

    state: {
        categories: [],
        categoriesById: {},
    },

    getters: {
        getCategory(state) {
            return (categoryId) => state.categoriesById[categoryId];
        },

        getCategoryName(state) {
            return (categoryId) => {
                let category = state.categoriesById[categoryId];
                const names = [category.name];
                while (category.parentId !== null) {
                    category = state.categoriesById[category.parentId];
                    names.unshift(category.name);
                }
                return names.join(':');
            }
        }
    },

    mutations: {
        [mutations.addCategory](state, category) {
            ensureAllFieldsPresent(category);
            insertCategory(state.categories, state.categoriesById, category);
            Vue.set(state.categoriesById, category.id, category);
        },

        [mutations.setCategories](state, newCategories) {
            const categories = [];
            const categoriesById = {};
            newCategories.forEach(category => {
                ensureAllFieldsPresent(category);
                categoriesById[category.id] = category;
            });
            newCategories.forEach(category => insertCategory(categories, categoriesById, category));
            state.categories = categories;
            state.categoriesById = categoriesById;
        },

        [mutations.updateCategory](state, changes) {
            const category = state.categoriesById[changes.id];
            if (changes.patch.id !== undefined && changes.patch.id !== category.id) {
                Vue.delete(state.categoriesById, category.id);
                Vue.set(state.categoriesById, changes.patch.id, category);
            }
            const currentList = category.parentId === null ? state.categories : state.categoriesById[category.parentId].children;
            const index = search(currentList, category, categoryComparator);
            currentList.splice(index, 1);
            Object.assign(category, changes.patch);
            insertCategory(state.categories, state.categoriesById, category);
        },

        [mutations.removeCategory](state, category) {
            const currentList = category.parentId === null ? state.categories : state.categoriesById[category.parentId].children;
            const index = search(currentList, category, categoryComparator);
            currentList.splice(index, 1);
        },
    },

    actions: {
        async [actions.loadCategories]({commit}) {
            const response = await client.categories();
            commit(mutations.setCategories, response.categories);
        },

        async [actions.addCategory]({commit, state}, category) {
            const newCategory = Object.assign({id: 'new-category'}, category);
            commit(mutations.addCategory, newCategory);
            try {
                const createdCategory = await client.createCategory(category);
                commit(mutations.updateCategory, {id: newCategory.id, patch: createdCategory});
                return state.categoriesById[createdCategory.id];
            } catch (error) {
                commit(mutations.removeCategory, newCategory);
                throw error;
            }
        },

        async [actions.updateCategory]({commit, state}, changes) {
            const category = state.categoriesById[changes.id];
            const original = Object.assign({}, category);
            commit(mutations.updateCategory, changes);
            try {
                await client.updateCategory(apiCategory(state.categoriesById[changes.id]));
            } catch (error) {
                commit(mutations.updateCategory, {id: category.id, patch: original});
                throw error;
            }
        },
    },
};
