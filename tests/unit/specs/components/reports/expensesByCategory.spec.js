import { expenseByCategoryReportData } from '../../../../../src/components/reports/expenseByCategoryReportData';
import { assert } from 'chai';

describe('Expense by Category Report Data', function() {
    const categoriesById = {
        c1: {
            id: 'c1',
            name: 'Cat1',
            categoryId: 'c1',
            parentId: null,
            children: [],
        },
        c2: {
            id: 'c2',
            name: 'Cat2',
            categoryId: 'c2',
            parentId: null,
            children: [],
        },
        c3: {
            id: 'c3',
            name: 'Cat3',
            categoryId: 'c3',
            parentId: null,
            children: ['c3a', 'c3b'],
        },
        c3a: {
            id: 'c3a',
            name: 'Cat3a',
            categoryId: 'c3a',
            parentId: 'c3',
            children: [],
        },
        c3b: {
            id: 'c3b',
            name: 'Cat3b',
            categoryId: 'c3b',
            parentId: 'c3',
            children: [],
        },
    };

    function getCategoryName(id) {
        return 'Name: ' + categoriesById[id].name;
    }

    it('should sum category month data', function() {
        const result = expenseByCategoryReportData(
            {
                c1: -1500,
                c2: -280,
            },
            categoriesById,
            getCategoryName
        );
        assert.deepEqual(result, [
            {
                categoryId: 'c1',
                name: 'Name: Cat1',
                totalExpenses: -1500,
                children: [
                    {
                        categoryId: 'c1',
                        name: 'Name: Cat1',
                        totalExpenses: -1500,
                    },
                ],
            },
            {
                categoryId: 'c2',
                name: 'Name: Cat2',
                totalExpenses: -280,
                children: [
                    {
                        categoryId: 'c2',
                        name: 'Name: Cat2',
                        totalExpenses: -280,
                    },
                ],
            },
        ]);
    });

    it('should add root id and name for sub-categories', function() {
        const result = expenseByCategoryReportData(
            {
                c1: -1500,
                c3a: -250,
                c3b: -30,
            },
            categoriesById,
            getCategoryName
        );
        assert.deepEqual(result, [
            {
                categoryId: 'c1',
                name: 'Name: Cat1',
                totalExpenses: -1500,
                children: [
                    {
                        categoryId: 'c1',
                        name: 'Name: Cat1',
                        totalExpenses: -1500,
                    },
                ],
            },
            {
                categoryId: 'c3',
                name: 'Name: Cat3',
                totalExpenses: -280,
                children: [
                    {
                        categoryId: 'c3a',
                        name: 'Name: Cat3a',
                        totalExpenses: -250,
                    },
                    {
                        categoryId: 'c3b',
                        name: 'Name: Cat3b',
                        totalExpenses: -30,
                    },
                ],
            },
        ]);
    });
});
