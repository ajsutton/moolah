const numberDetailedCategories = 10;
export default function summariseCategories(expensesByCategory, getCategoryName, categoriesById) {
    const columns = rollupToTopLevel(expensesByCategory, getCategoryName, categoriesById)
    .sort(([name1, value1], [name2, value2]) => {
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    });
    
    const detailed = columns.slice(0, Math.min(numberDetailedCategories, columns.length));
    const summarise = columns.slice(numberDetailedCategories);
    if (summarise.length > 0) {
        detailed.push(['Other', summarise.reduce((total, [id, value]) => total + value, 0)]);
    }
    return detailed;
}

function rollupToTopLevel(expensesByCategory, getCategoryName, categoriesById) {
    const topLevelCategories = {};
    expensesByCategory.map(({categoryId, totalExpenses}) => {
        const id = topLevelId(categoryId, categoriesById);
        topLevelCategories[id] = (topLevelCategories[id] || 0) + totalExpenses;
    });
    return Object.entries(topLevelCategories).map(([categoryId, totalExpenses]) => [getCategoryName(categoryId), totalExpenses]);
}

function topLevelId(categoryId, categoriesById) {
    let category = categoriesById[categoryId];
    while (category && category.parentId) {
        category = categoriesById[category.parentId];
    }
    return category.id;
}