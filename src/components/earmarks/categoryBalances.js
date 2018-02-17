function processCategory(categoryBalances, category, level) {
    const children = buildCategoryBalanceTree(categoryBalances, category.children, level + 1);
    const balance = categoryBalances[category.id] || 0;
    const subtotal = children.reduce((total, child) => total + child.subtotal, 0) + balance;

    return Object.assign({balance, subtotal, level}, category, {children: children});
}

export function buildCategoryBalanceTree(categoryBalances, categories, level = 0) {
    return categories
        .map(category => processCategory(categoryBalances, category, level))
        .filter(category => category.balance !== 0 || category.subtotal !== 0);
}
