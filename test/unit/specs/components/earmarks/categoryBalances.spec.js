import {assert} from 'chai';
import {buildCategoryBalanceTree} from '../../../../../src/components/earmarks/categoryBalances';

describe('Category Balances', function() {
    it('should return empty array when there are no category balances and no categories', function() {
        const result = buildCategoryBalanceTree({}, []);
        assert.deepEqual(result, []);
    });

    it('should return single top level entry when it has a balance', function() {
        const category1 = makeCategory('category1');
        const result = buildCategoryBalanceTree({'category1': 1000}, [category1]);
        assert.deepEqual(result, [Object.assign({balance: 1000, subtotal: 1000, level: 0}, category1)]);
    });

    it('should filter out top level entries with no balance', function() {
        const category1 = makeCategory('category1');
        const category2 = makeCategory('category2');
        const result = buildCategoryBalanceTree({'category1': 1000}, [category1, category2]);
        assert.deepEqual(result, [Object.assign({balance: 1000, subtotal: 1000, level: 0}, category1)]);
    });

    it('should include balance for child categories', function() {
        const childCategory = makeCategory('childCategory', 'parentCategory');
        const parentCategory = makeCategory('parentCategory', null, [childCategory]);
        const result = buildCategoryBalanceTree({'childCategory': 1000}, [parentCategory]);
        assert.deepEqual(result, [
            Object.assign({subtotal: 1000, balance: 0, level: 0}, parentCategory, {
                children: [
                    Object.assign({balance: 1000, subtotal: 1000, level: 1}, childCategory),
                ],
            }),
        ]);
    });

    it('should include multiple child categories in subtotal', function() {
        const childCategory1 = makeCategory('childCategory1', 'parentCategory');
        const childCategory2 = makeCategory('childCategory2', 'parentCategory');
        const parentCategory = makeCategory('parentCategory', null, [childCategory1, childCategory2]);
        const result = buildCategoryBalanceTree({'childCategory1': 1000, 'childCategory2': 500}, [parentCategory]);
        assert.deepEqual(result, [
            Object.assign({subtotal: 1500, balance: 0, level: 0}, parentCategory, {
                children: [
                    Object.assign({balance: 1000, subtotal: 1000, level: 1}, childCategory1),
                    Object.assign({balance: 500, subtotal: 500, level: 1}, childCategory2),
                ],
            }),
        ]);
    });

    it('should include arbitrarily nested child categories in subtotal', function() {
        const childCategory1 = makeCategory('childCategory1', 'parentCategory');
        const grandchildCategory1 = makeCategory('grandchildCategory1', 'childCategory1');
        const childCategory2 = makeCategory('childCategory2', 'parentCategory', [grandchildCategory1]);
        const parentCategory = makeCategory('parentCategory', null, [childCategory1, childCategory2]);
        const result = buildCategoryBalanceTree({'childCategory1': 1000, 'childCategory2': 500, 'grandchildCategory1': 200}, [parentCategory]);
        assert.deepEqual(result, [
            Object.assign({subtotal: 1700, balance: 0, level: 0}, parentCategory, {
                children: [
                    Object.assign({balance: 1000, subtotal: 1000, level: 1}, childCategory1),
                    Object.assign({balance: 500, subtotal: 700, level: 1}, childCategory2, {
                        children: [
                            Object.assign({balance: 200, subtotal: 200, level: 2}, grandchildCategory1)
                        ],
                    }),
                ],
            }),
        ]);
    });

    function makeCategory(id, parentId = null, children = []) {
        return {id: id, name: 'Name ' + id, parentId, children};
    }
});
