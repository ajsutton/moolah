import sinon from 'sinon';
import { assert } from 'chai';
import { mutations, actions } from '../../../../src/stores/categoryStore';
import categoryStoreLoader from 'inject-loader!babel-loader!../../../../src/stores/categoryStore';
import { createPinia, setActivePinia } from 'pinia';

describe('Category Store', function () {
    let nextId = 0;
    let client;
    let categoryStore;
    beforeEach(function () {
        setActivePinia(createPinia());
        client = {
            categories: sinon.stub(),
            createCategory: sinon.stub(),
            updateCategory: sinon.stub(),
        };
        categoryStore = categoryStoreLoader({
            '../api/client': client,
        }).useCategoryStore();
    });

    describe('Getters', function () {
        it('should get catgory by id', function () {
            const categoryA = makeCategory();
            const categoryB = makeCategory();
            createState(categoryA, categoryB);
            assert.deepEqual(
                categoryStore.getCategory(categoryA.id),
                categoryA
            );
            assert.deepEqual(
                categoryStore.getCategory(categoryB.id),
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
            createState(
                Object.assign({}, categoryA, {
                    children: [
                        Object.assign({}, categoryB, { children: [categoryC] }),
                    ],
                })
            );
            assert.deepEqual(
                categoryStore.getCategoryName(categoryA.id),
                'Parent'
            );
            assert.deepEqual(
                categoryStore.getCategoryName(categoryB.id),
                'Parent:SubCategory'
            );
            assert.deepEqual(
                categoryStore.getCategoryName(categoryC.id),
                'Parent:SubCategory:Leaf'
            );
        });
    });

    describe('Mutations', function () {
        describe('addCategory', function () {
            it('should add category', function () {
                const category = makeCategory();
                createState();
                categoryStore[mutations.addCategory](category);

                assert.deepEqual(currentState(), {
                    categories: [category],
                    categoriesById: { [category.id]: category },
                });
            });

            it('should keep categories sorted by name', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                const categoryC = makeCategory({ name: 'C' });
                createState(categoryA, categoryC);
                categoryStore[mutations.addCategory](categoryB);

                assert.deepEqual(
                    currentState(),
                    expectedState(categoryA, categoryB, categoryC)
                );
            });

            it('should add child categories', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({
                    name: 'B',
                    parentId: categoryA.id,
                });
                createState(categoryA);
                categoryStore[mutations.addCategory](categoryB);

                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState();
                categoryStore[mutations.setCategories]([
                    categoryB,
                    categoryC,
                    categoryA,
                ]);

                assert.deepEqual(
                    currentState(),
                    expectedState(
                        Object.assign({}, categoryA, { children: [categoryB] }),
                        categoryC
                    )
                );
            });
        });

        describe('updateCategory', function () {
            it('should change category name and ID', function () {
                const categoryA = makeCategory({ name: 'A' });
                createState(categoryA);
                categoryStore[mutations.updateCategory]({
                    id: categoryA.id,
                    patch: { id: 'new-id', name: 'New name' },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
                        makeCategory({ id: 'new-id', name: 'New name' })
                    )
                );
            });

            it('should add a parent to a category', function () {
                const categoryA = makeCategory({ name: 'A' });
                const categoryB = makeCategory({ name: 'B' });
                createState(categoryA, categoryB);
                categoryStore[mutations.updateCategory]({
                    id: categoryA.id,
                    patch: { parentId: categoryB.id },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState(
                    Object.assign({}, categoryA, { children: [categoryB] })
                );
                categoryStore[mutations.updateCategory]({
                    id: categoryB.id,
                    patch: { parentId: null },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState(
                    Object.assign({}, categoryA, { children: [categoryC] }),
                    categoryB
                );
                categoryStore[mutations.updateCategory]({
                    id: categoryC.id,
                    patch: { parentId: categoryB.id },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState(
                    Object.assign({}, categoryA, { children: [categoryC] }),
                    categoryB
                );
                categoryStore[mutations.updateCategory]({
                    id: categoryB.id,
                    patch: { parentId: categoryA.id },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState(categoryA, categoryB, categoryC);
                categoryStore[mutations.updateCategory]({
                    id: categoryB.id,
                    patch: { name: 'G' },
                });
                assert.deepEqual(
                    currentState(),
                    expectedState(
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
                createState();
                await categoryStore[actions.loadCategories]();
                assert.deepEqual(
                    currentState(),
                    expectedState(categoryA, categoryC)
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
                createState(categoryA);
                await categoryStore[actions.addCategory]({ name: 'B' });

                assert.deepEqual(
                    currentState(),
                    expectedState(categoryA, categoryB)
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
                createState(categoryA);
                await categoryStore[actions.addCategory]({
                    name: 'B',
                    parentId: categoryA.id,
                });

                assert.deepEqual(
                    currentState(),
                    expectedState(
                        Object.assign({}, categoryA, { children: [categoryB] })
                    )
                );
            });

            it('should remove new category when server rejects creation', async function () {
                const categoryA = makeCategory({ name: 'A' });
                client.createCategory
                    .withArgs({ name: 'B', parentId: categoryA.id })
                    .rejects('Failed');
                createState(Object.assign({}, categoryA));
                let err = null;
                try {
                    await categoryStore[actions.addCategory]({
                        name: 'B',
                        parentId: categoryA.id,
                    });
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                assert.deepEqual(currentState(), expectedState(categoryA));
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
                createState(Object.assign({}, categoryA));
                await categoryStore[actions.updateCategory](changes);
                assert.deepEqual(
                    currentState(),
                    expectedState(makeCategory(modifiedA))
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
                createState(categoryA);
                let err = null;
                try {
                    await categoryStore[actions.updateCategory](changes);
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                assert.deepEqual(currentState(), expectedState(categoryA));
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
        categoryStore.categories = topLevelCategories;
        const addCategory = category => {
            categoryStore.categoriesById[category.id] = category;
            category.children.forEach(addCategory);
        };
        topLevelCategories.forEach(addCategory);
    }

    function expectedState(...topLevelCategories) {
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

    function currentState() {
        return {
            categories: categoryStore.categories,
            categoriesById: categoryStore.categoriesById,
        };
    }
});
