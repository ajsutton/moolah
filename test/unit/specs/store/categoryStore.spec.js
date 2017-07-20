import sinon from 'sinon';
import {assert} from 'chai';
import {mutations, actions} from '../../../../src/store/categoryStore';
import categoryStoreLoader from 'inject-loader!../../../../src/store/categoryStore';
import testAction from './testAction';

describe('Category Store', function() {
    let nextId = 0;
    let client;
    let categoryStore;
    beforeEach(function() {
        client = {
            categories: sinon.stub(),
            createCategory: sinon.stub(),
        };
        categoryStore = categoryStoreLoader({
            '../api/client': client,
        }).default;
    });

    describe('Mutations', function() {
        describe('addCategory', function() {
            it('should add category', function() {
                const category = makeCategory();
                const state = createState();
                categoryStore.mutations[mutations.addCategory](state, category);

                assert.deepEqual(state, {
                    categories: [category],
                    categoriesById: {[category.id]: category},
                });
            });

            it('should keep categories sorted by name', function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B'});
                const categoryC = makeCategory({name: 'C'});
                const state = createState(categoryA, categoryC);
                categoryStore.mutations[mutations.addCategory](state, categoryB);

                assert.deepEqual(state, createState(categoryA, categoryB, categoryC));
            });

            it('should add child categories', function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B', parentId: categoryA.id});
                const state = createState(categoryA);
                categoryStore.mutations[mutations.addCategory](state, categoryB);

                assert.deepEqual(state, createState(Object.assign({}, categoryA, {children: [categoryB]})));
            });
        });

        describe('setCategories', function() {
            it('should replace categories', function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B', parentId: categoryA.id});
                const categoryC = makeCategory({name: 'C'});
                const state = createState();
                categoryStore.mutations[mutations.setCategories](state, [categoryB, categoryC, categoryA]);

                assert.deepEqual(state, createState(Object.assign({}, categoryA, {children: [categoryB]}), categoryC));
            });
        });

        describe('updateCategory', function() {
            it('should change category name and ID', function() {
                const categoryA = makeCategory({name: 'A'});
                const state = createState(categoryA);
                categoryStore.mutations[mutations.updateCategory](state, {id: categoryA.id, patch: {id: 'new-id', name: 'New name'}});
                assert.deepEqual(state, createState(makeCategory({id: 'new-id', name: 'New name'})));
            });

            it('should add a parent to a category', function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B'});
                const state = createState(categoryA, categoryB);
                categoryStore.mutations[mutations.updateCategory](state, {id: categoryA.id, patch: {parentId: categoryB.id}});
                assert.deepEqual(state, createState(Object.assign({}, categoryB, {children: [categoryA]})));
            });

            it('should move category to top level');
            it('should move category to a different parent');
        });
    });

    describe('Actions', function() {
        describe('loadCategories', function() {
            it('should load categories from server', async function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B', parentId: categoryA.id});
                const categoryC = makeCategory({name: 'C'});
                const response = {
                    categories: [categoryA, categoryB, categoryC],
                };
                client.categories.resolves(response);
                await testAction(
                    categoryStore,
                    actions.loadCategories,
                    {
                        state: createState(),
                    },
                    [
                        {type: mutations.setCategories, payload: [categoryA, categoryB, categoryC]},
                    ],
                );
            });
        });

        describe('addCategory', function() {
            it('should create a new top level category', async function() {
                const categoryA = makeCategory({name: 'A'});
                const categoryB = makeCategory({name: 'B'});
                client.createCategory.withArgs({name: 'B'}).resolves(categoryB);
                await testAction(
                    categoryStore,
                    actions.addCategory,
                    {
                        state: createState(categoryA),
                        payload: {name: 'B'},
                    },
                    [
                        {type: mutations.addCategory, payload: {id: 'new-category', name: 'B'}},
                        {type: mutations.updateCategory, payload: {id: 'new-category', patch: categoryB}},
                    ],
                );
            });
        });
    });

    function makeCategory(data = {}) {
        const id = nextId++;
        return Object.assign({id: `cat-${id}`, name: 'Category Name', parentId: null, children: []}, data);
    }

    function createState(...topLevelCategories) {
        const state = {
            categories: topLevelCategories,
            categoriesById: {},
        };
        const addCategory = category => {
            state.categoriesById[category.id] = category;
            category.children.forEach(addCategory);
        };
        topLevelCategories.forEach(addCategory);
        return state;
    }
});
