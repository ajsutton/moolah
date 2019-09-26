import { rootLevelId } from "../analysis/categories/rootLevelId";

export function expenseByCategoryReportData(
    expenseBreakdown,
    categoriesById,
    getCategoryName
) {
    const totals = {};
    expenseBreakdown.forEach(expense => {
        const existing = totals[expense.categoryId];
        if (existing) {
            existing.totalExpenses += expense.totalExpenses;
        } else {
            var rootId = rootLevelId(expense.categoryId, null, categoriesById);
            if (rootId == expense.categoryId) {
                rootId = undefined;
            }
            totals[expense.categoryId] = {
                categoryId: expense.categoryId,
                name: getCategoryName(expense.categoryId),
                rootId,
                rootName: rootId ? getCategoryName(rootId) : undefined,
                totalExpenses: expense.totalExpenses
            };
        }
    });
    return Object.values(totals).sort((a, b) => (a.name > b.name ? 1 : -1));
}
