import { rootLevelId } from '../analysis/categories/rootLevelId';

export const sortByExpenses = (a, b) => {
    if (a.totalExpenses > b.totalExpenses) {
        return 1;
    } else if (a.totalExpenses == b.totalExpenses) {
        return 0;
    } else {
        return -1;
    }
};

export const sortByIncome = (a, b) => -1 * sortByExpenses(a, b);

export function expenseByCategoryReportData(
    expenseBreakdown,
    categoriesById,
    getCategoryName,
    sortBy
) {
    const roots = {};
    Object.entries(expenseBreakdown).forEach(([categoryId, totalExpenses]) => {
        const rootId = rootLevelId(categoryId, null, categoriesById);
        let root = roots[rootId];
        if (!root) {
            root = {
                categoryId: rootId,
                name: getCategoryName(rootId),
                totalExpenses: 0,
                children: {},
            };
            roots[rootId] = root;
        }

        let child = root.children[categoryId];
        if (!child) {
            child = {
                categoryId,
                name: getCategoryName(categoryId),
                totalExpenses: 0,
            };
            root.children[categoryId] = child;
        }
        child.totalExpenses += totalExpenses;
    });

    return Object.values(roots)
        .map(root => {
            const children = Object.values(root.children).sort(sortByExpenses);
            return {
                categoryId: root.categoryId,
                name: root.name,
                totalExpenses: children
                    .map(child => child.totalExpenses)
                    .reduce((a, b) => a + b),
                children,
            };
        })
        .sort(sortBy || sortByExpenses);
}
