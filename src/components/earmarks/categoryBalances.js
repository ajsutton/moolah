function processCategory(categoryData, category, level) {
    const children = buildCategoryBalanceTree(
        categoryData,
        category.children,
        level + 1
    );
    const { balance, budget } = categoryData[category.id] || {
        balance: 0,
        budget: 0,
    };
    const subtotal =
        children.reduce((total, child) => total + child.subtotal, 0) + balance;
    const budgetSubtotal =
        children.reduce((total, child) => total + child.budgetSubtotal, 0) +
        budget;

    return Object.assign(
        { balance, subtotal, budget, budgetSubtotal, level },
        category,
        { children: children }
    );
}

export function buildCategoryBalanceTree(categoryData, categories, level = 0) {
    return categories
        .map(category => processCategory(categoryData, category, level))
        .filter(
            category =>
                category.balance !== 0 ||
                category.subtotal !== 0 ||
                category.budget !== 0 ||
                category.budgetSubtotal !== 0
        );
}
