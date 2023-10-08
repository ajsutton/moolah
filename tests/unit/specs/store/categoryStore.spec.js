import sinon from 'sinon';
import { assert } from 'chai';
import { mutations, actions } from '../../../../src/store/categoryStore';
import categoryStoreLoader from 'inject-loader!babel-loader!../../../../src/store/categoryStore';
import testAction from './testAction';

describe('Category Store', function () {
    let nextId = 0;
    let client;
    let categoryStore;
    beforeEach(function () {
        client = {
            categories: sinon.stub(),
            createCategory: sinon.stub(),
            updateCategory: sinon.stub(),
        };
        categoryStore = categoryStoreLoader({
            '../api/client': client,
        }).default;
    });

    describe('Getters', function () {
        it('should get catgory by id', function () {
            const categoryA = makeCategory();
            const categoryB = makeCategory();
            const state = createState(categoryA, categoryB);
            assert.deepEqual(
                categoryStore.getters.getCategory(state)(categoryA.id),
                categoryA
            );
            assert.deepEqual(
                categoryStore.getters.getCategory(state)(categoryB.id),
                categoryB
            );
        });

        it('should get category full name', function () {
            const categoryA = makeCategory({ name: 'Parent' });
            const categoryB = makeCategory({
                name: 'SubCategory',
                parentId: categoryA.id,
            });
            const categoryC = makeCategory({
                name: 'Leaf',
                parentId: categoryB.id,
            });
            const state = createState(
                Object.assign({}, categoryA, {
                    children: [
                        Object.assign({}, categoryB, { children: [categoryC] }),
                    ],
                })
            );
            assert.deepEqual(
                categoryStore.getters.getCategoryName(state)(categoryA.id),
                'Parent'
            );
            assert.deepEqual(
                categoryStore.getters.getCategoryName(state)(categoryB.id),
                'Parent:SubCategory'
            );
            assert.deepEqual(
                categoryStore.getters.getCategoryName(state)(categoryC.id),
                'Parent:SubCategory:Leaf'
            );
        });
    });

    describe('Mutations', function () {
        describe('addCategory', function () {
            it('should add category', function () {
                const category = makeCategory();
                const state = createState();
                categoryStore.mutations[mutations.addCategory](state, category);

                assert.deepEqual(state, {
                    categories: [category],
                    categoriesById: { [category.id]: category },
                });
            });

            it('should keep categories sorted by name', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const categoryC = makeCategory({ name: 'C' });
                const state = createState(categoryA, categoryC);
                categoryStore.mutations[mutations.addCategory](
                    state,
                    categoryB
                );

                assert.deepEqual(
                    state,
                    createState(categoryA, categoryB, categoryC)
                );
            });

            it('should add child categories', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                const state = createState(categoryA);
                categoryStore.mutations[mutations.addCategory](
                    state,
                    categoryB
                );

                assert.deepEqual(
                    state,
                    createState(
                        Object.assign({}, categoryA, { children: [categoryB] })
                    )
                );
            });
        });

        describe('setCategories', function () {
            it('should replace categories', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                const categoryC = makeCategory({ name: 'C' });
                const state = createState();
                categoryStore.mutations[mutations.setCategories](state, [
                    categoryB,
                    categoryC,
                    categoryA,
                ]);

                assert.deepEqual(
                    state,
                    createState(
                        Object.assign({}, categoryA, { children: [categoryB] }),
                        categoryC
                    )
                );
            });
        });

        describe('updateCategory', function () {
            it('should change category name and ID', function () {
                const categoryA = makeCategory({ name: 'A' });
                const state = createState(categoryA);
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryA.id,
                    patch: { id: 'new-id', name: 'New name' },
                });
                assert.deepEqual(
                    state,
                    createState(
                        makeCategory({ id: 'new-id', name: 'New name' })
                    )
                );
            });

            it('should add a parent to a category', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const state = createState(categoryA, categoryB);
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryA.id,
                    patch: { parentId: categoryB.id },
                });
                assert.deepEqual(
                    state,
                    createState(
                        Object.assign({}, categoryB, { children: [categoryA] })
                    )
                );
            });

            it('should move category to top level', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                const state = createState(
                    Object.assign({}, categoryA, { children: [categoryB] })
                );
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryB.id,
                    patch: { parentId: null },
                });
                assert.deepEqual(
                    state,
                    createState(
                        categoryA,
                        Object.assign({}, categoryB, { parentId: null })
                    )
                );
            });

            it('should move category to a different parent', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const categoryC = makeCategory({
                    name: 'C',
                    parentId: categoryA.id,
                });
                const state = createState(
                    Object.assign({}, categoryA, { children: [categoryC] }),
                    categoryB
                );
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryC.id,
                    patch: { parentId: categoryB.id },
                });
                assert.deepEqual(
                    state,
                    createState(
                        categoryA,
                        Object.assign({}, categoryB, { children: [categoryC] })
                    )
                );
            });

            it('should maintain sort order when moving category to a different parent', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const categoryC = makeCategory({
                    name: 'C',
                    parentId: categoryA.id,
                });
                const state = createState(
                    Object.assign({}, categoryA, { children: [categoryC] }),
                    categoryB
                );
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryB.id,
                    patch: { parentId: categoryA.id },
                });
                assert.deepEqual(
                    state,
                    createState(
                        Object.assign({}, categoryA, {
                            children: [categoryB, categoryC],
                        })
                    )
                );
            });

            it('should maintain alphabetical order when name changes', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const categoryC = makeCategory({ name: 'C' });
                const state = createState(categoryA, categoryB, categoryC);
                categoryStore.mutations[mutations.updateCategory](state, {
                    id: categoryB.id,
                    patch: { name: 'G' },
                });
                assert.deepEqual(
                    state,
                    createState(
                        categoryA,
                        categoryC,
                        Object.assign({}, categoryB, { name: 'G' })
                    )
                );
            });
        });
    });

    describe('Actions', function () {
        describe('loadCategories', function () {
            it('should load categories from server', async function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                const categoryC = makeCategory({ name: 'C' });
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
                        {
                            type: mutations.setCategories,
                            payload: [categoryA, categoryB, categoryC],
                        },
                    ]
                );
            });
        });

        describe('addCategory', function () {
            it('should create a new top level category', async function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                client.createCategory
                    .withArgs({ name: 'B' })
                    .resolves(categoryB);
                await testAction(
                    categoryStore,
                    actions.addCategory,
                    {
                        state: createState(categoryA),
                        payload: { name: 'B' },
                    },
                    [
                        {
                            type: mutations.addCategory,
                            payload: { id: 'new-category', name: 'B' },
                        },
                        {
                            type: mutations.updateCategory,
                            payload: { id: 'new-category', patch: categoryB },
                        },
                    ]
                );
            });

            it('should create child category', async function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                client.createCategory
                    .withArgs({ name: 'B', parentId: categoryA.id })
                    .resolves(categoryB);
                await testAction(
                    categoryStore,
                    actions.addCategory,
                    {
                        state: createState(categoryA),
                        payload: { name: 'B', parentId: categoryA.id },
                    },
                    [
                        {
                            type: mutations.addCategory,
                            payload: {
                                id: 'new-category',
                                name: 'B',
                                parentId: categoryA.id,
                            },
                        },
                        {
                            type: mutations.updateCategory,
                            payload: { id: 'new-category', patch: categoryB },
                        },
                    ]
                );
            });

            it('should remove new category when server rejects creation', async function () {
                const categoryA = makeCategory({ name: 'A' });
                client.createCategory
                    .withArgs({ name: 'B', parentId: categoryA.id })
                    .rejects('Failed');
                await testAction(
                    categoryStore,
                    actions.addCategory,
                    {
                        state: createState(categoryA),
                        payload: { name: 'B', parentId: categoryA.id },
                        ignoreFailures: true,
                    },
                    [
                        {
                            type: mutations.addCategory,
                            payload: {
                                id: 'new-category',
                                name: 'B',
                                parentId: categoryA.id,
                            },
                        },
                        {
                            type: mutations.removeCategory,
                            payload: {
                                id: 'new-category',
                                name: 'B',
                                parentId: categoryA.id,
                                children: [],
                            },
                        },
                    ]
                );
            });
        });

        describe('updateCategory', function () {
            it('should update category and notify server', async function () {
                const categoryA = makeCategory({ name: 'A' });
                const modifiedA = {
                    id: categoryA.id,
                    name: 'New Name',
                    parentId: null,
                };
                const changes = {
                    id: categoryA.id,
                    patch: { name: 'New Name' },
                };
                client.updateCategory.withArgs(modifiedA).resolves(modifiedA);
                await testAction(
                    categoryStore,
                    actions.updateCategory,
                    {
                        state: createState(categoryA),
                        payload: changes,
                    },
                    [{ type: mutations.updateCategory, payload: changes }]
                );
                sinon.assert.calledWith(client.updateCategory, modifiedA);
            });

            it('should rollback changes when server rejects creation', async function () {
                const categoryA = makeCategory({ name: 'A' });
                const modifiedA = {
                    id: categoryA.id,
                    name: 'New Name',
                    parentId: null,
                };
                const changes = {
                    id: categoryA.id,
                    patch: { name: 'New Name' },
                };
                client.updateCategory.withArgs(modifiedA).rejects('Failed');
                await testAction(
                    categoryStore,
                    actions.updateCategory,
                    {
                        state: createState(categoryA),
                        payload: changes,
                        ignoreFailures: true,
                    },
                    [
                        { type: mutations.updateCategory, payload: changes },
                        {
                            type: mutations.updateCategory,
                            payload: { id: categoryA.id, patch: categoryA },
                        },
                    ]
                );
            });
        });
    });

    function makeCategory(data = {}) {
        const id = nextId++;
        return Object.assign(
            {
                id: `cat-${id}`,
                name: 'Category Name',
                parentId: null,
                children: [],
            },
            data
        );
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
