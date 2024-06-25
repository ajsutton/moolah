import { defineStore } from 'pinia';
import client from '../api/client';
import search from 'binary-search';
import Vue from 'vue';

export const actions = {
    loadCategories: 'LOAD_CATEGORIES',
    addCategory: 'ADD_CATEGORY',
    updateCategory: 'UPDATE_CATEGORY',
    deleteCategory: 'DELETE_CATEGORY',
};

export const mutations = {
    addCategory: 'ADD_CATEGORY_MUTATION',
    setCategories: 'SET_CATEGORIES',
    updateCategory: 'UPDATE_CATEGORY_MUTATION',
    removeCategory: 'REMOVE_CATEGORY_MUTATION',
};

const categoryFields = () => ({
    id: null,
    name: null,
    parentId: null,
    children: [],
});

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
        .forEach(fieldName => (api[fieldName] = category[fieldName]));
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
    const insertInto =
        category.parentId !== null
            ? categoriesById[category.parentId].children
            : categories;
    let insertIndex = search(insertInto, category, categoryComparator);
    if (insertIndex < 0) {
        insertIndex = -insertIndex - 1;
    }
    insertInto.splice(insertIndex, 0, category);
};

export const useCategoryStore = defineStore('categories', {
    state: state => ({
        categories: [],
        categoriesById: {},
    }),

    getters: {
        getCategory(state) {
            return categoryId => state.categoriesById[categoryId];
        },

        getCategoryName(state) {
            return categoryId => {
                let category = state.categoriesById[categoryId];
                const names = [category.name];
                while (category.parentId !== null) {
                    category = state.categoriesById[category.parentId];
                    names.unshift(category.name);
                }
                return names.join(':');
            };
        },
    },

    actions: {
        [mutations.addCategory](category) {
            ensureAllFieldsPresent(category);
            insertCategory(this.categories, this.categoriesById, category);
            Vue.set(this.categoriesById, category.id, category);
        },

        [mutations.setCategories](newCategories) {
            const categories = [];
            const categoriesById = {};
            newCategories.forEach(category => {
                ensureAllFieldsPresent(category);
                categoriesById[category.id] = category;
            });
            newCategories.forEach(category =>
                insertCategory(categories, categoriesById, category)
            );
            this.categories = categories;
            this.categoriesById = categoriesById;
        },

        [mutations.updateCategory](changes) {
            const category = this.categoriesById[changes.id];
            if (
                changes.patch.id !== undefined &&
                changes.patch.id !== category.id
            ) {
                Vue.delete(this.categoriesById, category.id);
                Vue.set(this.categoriesById, changes.patch.id, category);
            }
            const currentList =
                category.parentId === null
                    ? this.categories
                    : this.categoriesById[category.parentId].children;
            const index = search(currentList, category, categoryComparator);
            currentList.splice(index, 1);
            Object.assign(category, changes.patch);
            insertCategory(this.categories, this.categoriesById, category);
        },

        [mutations.removeCategory](category) {
            const currentList =
                category.parentId === null
                    ? this.categories
                    : this.categoriesById[category.parentId].children;
            const index = search(currentList, category, categoryComparator);
            currentList.splice(index, 1);
            delete this.categoriesById[category.id];
        },

        async [actions.loadCategories]() {
            const response = await client.categories();
            this[mutations.setCategories](response.categories);
        },

        async [actions.addCategory](category) {
            const newCategory = Object.assign({ id: 'new-category' }, category);
            this[mutations.addCategory](newCategory);
            try {
                const createdCategory = await client.createCategory(category);
                this[mutations.updateCategory]({
                    id: newCategory.id,
                    patch: createdCategory,
                });
                return this.categoriesById[createdCategory.id];
            } catch (error) {
                this[mutations.removeCategory](newCategory);
                throw error;
            }
        },

        async [actions.updateCategory](changes) {
            const category = this.categoriesById[changes.id];
            const original = Object.assign({}, category);
            this[mutations.updateCategory](changes);
            try {
                await client.updateCategory(
                    apiCategory(this.categoriesById[changes.id])
                );
            } catch (error) {
                this[mutations.updateCategory]({
                    id: category.id,
                    patch: original,
                });
                throw error;
            }
        },

        async [actions.deleteCategory](options) {
            const category = this.categoriesById[options.id];
            const replacement = this.categoriesById[options.replaceWith];
            this[mutations.removeCategory](category);
            try {
                await client.deleteCategory(category, replacement);
            } catch (error) {
                this[mutations.addCategory](category);
                throw error;
            }
        },
    },
});
