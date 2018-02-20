import {rootLevelId} from './categories/rootLevelId';

export function summariseCategories(expensesByCategory, rootCategoryId, categoriesById) {
    return rollupToRootLevel(expensesByCategory, rootCategoryId, categoriesById)
    .sort(([name1, value1], [name2, value2]) => {
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    });
}

function rollupToRootLevel(expensesByCategory, rootCategoryId, categoriesById) {
    const rootLevelCategories = {};
    expensesByCategory.map(({categoryId, totalExpenses}) => {
        const id = rootLevelId(categoryId, rootCategoryId, categoriesById);
        if (id) {
            rootLevelCategories[id] = (rootLevelCategories[id] || 0) + totalExpenses;
        }
    });
    return Object.entries(rootLevelCategories).map(([categoryId, totalExpenses]) => [categoriesById[categoryId].name, totalExpenses, categoryId]);
}

