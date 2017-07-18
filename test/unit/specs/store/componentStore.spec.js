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
            transactions: sinon.stub(),
            createTransaction: sinon.stub(),
            updateTransaction: sinon.stub(),
            deleteTransaction: sinon.stub(),
        };
        categoryStore = categoryStoreLoader({
            '../api/client': client,
        }).default;
    });

    describe('Mutations', function() {
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
