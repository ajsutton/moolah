export default function summariseCategories(expensesByCategory, rootCategoryId, getCategoryName, categoriesById) {
    return rollupToRootLevel(expensesByCategory, rootCategoryId, getCategoryName, categoriesById)
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

function rollupToRootLevel(expensesByCategory, rootCategoryId, getCategoryName, categoriesById) {
    const rootLevelCategories = {};
    expensesByCategory.map(({categoryId, totalExpenses}) => {
        const id = rootLevelId(categoryId, rootCategoryId, categoriesById);
        if (id) {
            rootLevelCategories[id] = (rootLevelCategories[id] || 0) + totalExpenses;
        }
    });
    return Object.entries(rootLevelCategories).map(([categoryId, totalExpenses]) => [getCategoryName(categoryId), totalExpenses, categoryId]);
}

function rootLevelId(categoryId, rootCategoryId, categoriesById) {
    let category = categoriesById[categoryId];
    while (category && category.parentId && category.parentId !== rootCategoryId) {
        category = categoriesById[category.parentId];
    }
    return category && (category.parentId == rootCategoryId || category.id == rootCategoryId) ? category.id : null;
}