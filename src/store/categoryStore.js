import client from '../api/client';
import search from 'binary-search';
import Vue from 'vue';

export const actions = {
    loadCategories: 'LOAD_CATEGORIES',
    addCategory: 'ADD_CATEGORY',
};

export const mutations = {
    addCategory: 'ADD_CATEGORY',
    setCategories: 'SET_CATEGORIES',
    updateCategory: 'UPDATE_CATEGORY',
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

const ensureAllFieldsPresent = category => {
    Object.entries(categoryFields()).forEach(([field, defaultValue]) => {
        if (!category.hasOwnProperty(field)) {
            category[field] = defaultValue;
        }
    });
    return category;
};

const insertCategory = (categories, categoriesById, category) => {
    ensureAllFieldsPresent(category);
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

    mutations: {
        [mutations.addCategory](state, category) {
            insertCategory(state.categories, state.categoriesById, category);
            Vue.set(state.categoriesById, category.id, category);
        },

        [mutations.setCategories](state, newCategories) {
            const categories = [];
            const categoriesById = {};
            newCategories.forEach(category => {
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
            const parentChanged = changes.patch.parentId !== undefined && changes.patch.parentId !== category.parentId;
            if (parentChanged) {
                const currentList = category.parentId === null ? state.categories : state.categoriesById[category.parentId].children;
                const index = search(currentList, category, categoryComparator);
                currentList.splice(currentList, 1);
            }
            Object.assign(category, changes.patch);
            if (parentChanged) {
                insertCategory(state.categories, state.categoriesById, category);
            }
        }
    },

    actions: {
        async [actions.loadCategories]({commit}) {
            const response = await client.categories();
            commit(mutations.setCategories, response.categories);
        },

        async [actions.addCategory]({commit}, category) {
            const newCategory = Object.assign({id: 'new-category'}, category);
            commit(mutations.addCategory, newCategory);
            const createdCategory = await client.createCategory(category);
            commit(mutations.updateCategory, {id: newCategory.id, patch: createdCategory});
        },
    },
};
