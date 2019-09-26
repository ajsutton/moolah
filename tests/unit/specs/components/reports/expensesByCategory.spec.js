import { expenseByCategoryReportData } from "../../../../../src/components/reports/expenseByCategoryReportData";
import { assert } from "chai";

describe("Expense by Category Report Data", function() {
    const categoriesById = {
        c1: { id: 'c1', name: "Cat1", categoryId: "c1", parentId: null, children: [] },
        c2: { id: 'c2', name: "Cat2", categoryId: "c2", parentId: null, children: [] },
        c3: { id: 'c3', name: "Cat3", categoryId: 'c3', parentId: null, children: ['c3a', 'c3b'] },
        c3a: { id: 'c3a', name: 'Cat3a', categoryId: 'c3a', parentId: 'c3', children: [] },
        c3b: { id: 'c3b', name: 'Cat3b', categoryId: 'c3b', parentId: 'c3', children: [] },
    };

    function getCategoryName(id) {
        return "Name: " + categoriesById[id].name;
    }

    it("should sum category month data", function() {
        const result = expenseByCategoryReportData(
            [
                { categoryId: "c1", month: 201904, totalExpenses: -1000 },
                { categoryId: "c1", month: 201905, totalExpenses: -500 },
                { categoryId: "c2", month: 201904, totalExpenses: -250 },
                { categoryId: "c2", month: 201906, totalExpenses: -30 }
            ],
            categoriesById,
            getCategoryName
        );
        assert.deepEqual(result, [
            { categoryId: 'c1', totalExpenses: -1500, rootId: undefined, rootName: undefined, name: 'Name: Cat1' },
            { categoryId: 'c2', totalExpenses: -280, rootId: undefined, rootName: undefined, name: 'Name: Cat2' },
        ]);
    });

    it('should add root id and name for sub-categories', function()  {
        const result = expenseByCategoryReportData(
            [
                { categoryId: "c1", month: 201904, totalExpenses: -1000 },
                { categoryId: "c1", month: 201905, totalExpenses: -500 },
                { categoryId: "c3a", month: 201904, totalExpenses: -250 },
                { categoryId: "c3b", month: 201906, totalExpenses: -30 }
            ],
            categoriesById,
            getCategoryName
        );
        assert.deepEqual(result, [
            { categoryId: 'c1', totalExpenses: -1500, rootId: undefined, rootName: undefined, name: 'Name: Cat1' },
            { categoryId: 'c3a', totalExpenses: -250, rootId: 'c3', rootName: 'Name: Cat3', name: 'Name: Cat3a' },
            { categoryId: 'c3b', totalExpenses: -30, rootId: 'c3', rootName: 'Name: Cat3', name: 'Name: Cat3b' },
        ]);
    });
});
