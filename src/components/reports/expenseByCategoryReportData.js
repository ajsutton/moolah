import { rootLevelId } from "../analysis/categories/rootLevelId";

const sortByExpenses = (a, b) => {
    if (a.totalExpenses > b.totalExpenses) {
        return 1;
    } else if (a.totalExpenses == b.totalExpenses) {
        return 0;
    } else {
        return -1;
    }
};

export function expenseByCategoryReportData(
    expenseBreakdown,
    categoriesById,
    getCategoryName
) {
    const roots = {};
    Object.entries(expenseBreakdown).forEach(([categoryId, totalExpenses]) => {
        var rootId = rootLevelId(categoryId, null, categoriesById);
        var root = roots[rootId];
        if (!root) {
            root = {
                categoryId: rootId,
                name: getCategoryName(rootId),
                totalExpenses: 0,
                children: {}
            };
            roots[rootId] = root;
        }

        var child = root.children[categoryId];
        if (!child) {
            child = {
                categoryId: categoryId,
                name: getCategoryName(categoryId),
                totalExpenses: 0
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
                children
            };
        })
        .sort(sortByExpenses);
}
