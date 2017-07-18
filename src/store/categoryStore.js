import client from '../api/client';
import search from 'binary-search';
import Vue from 'vue';

export const actions = {};

export const mutations = {
    addCategory: 'ADD_CATEGORY',
};

const categoryFields = {id: null, name: null, parentId: null, children: []};

const categoryComparator = (category1, category2) => {
    if (category1.name < category2.name) {
        return 1;
    } else if (category1.name > category2.name) {
        return -1;
    } else if (category1.id < category2.id) {
        return -1;
    } else if (category1.id > category2.id) {
        return 1;
    } else {
        return 0;
    }
};

const ensureAllFieldsPresent = category => {
    Object.entries(categoryFields).forEach(([field, defaultValue]) => {
        if (!category.hasOwnProperty(field)) {
            category[field] = defaultValue;
        }
    });
    return category;
};

export default {
    namespaced: true,

    state: {
        categories: [],
        categoriesById: {},
    },

    mutations: {
        [mutations.addCategory](state, category) {
            ensureAllFieldsPresent(category);
            const insertInto = category.parentId !== null ? state.categoriesById[category.parentId].children : state.categories;
            const insertIndex = search(insertInto, category, categoryComparator);
            insertInto.splice(insertIndex, 0, category);
            Vue.set(state.categoriesById, category.id, category);
        },
    },

    actions: {},
};
