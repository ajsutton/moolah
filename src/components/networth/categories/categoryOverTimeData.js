import {rootLevelId} from './rootLevelId';
import formatDate from 'date-fns/format';

export function categoriesOverTimeGraphData(expensesByCategory, getCategoryName, categoriesById) {
    const rootLevelCategories = {};
    const allMonths = new Set();
    expensesByCategory.map(({categoryId, month, totalExpenses}) => {
        const id = rootLevelId(categoryId, null, categoriesById);
        if (id) {
            allMonths.add(month);
            rootLevelCategories[id] = rootLevelCategories[id] || {};
            rootLevelCategories[id][month] = (rootLevelCategories[id][month] || 0) + -totalExpenses;
        }
    });
    const orderedMonths = Array.from(allMonths).sort();

    const totals = calculateMonthTotals(rootLevelCategories, orderedMonths);

    const columns = Object.entries(rootLevelCategories)
        .map(([categoryId, months]) => {
            return [getCategoryName(categoryId)].concat(orderedMonths.map(month => Math.max(0, months[month] || 0) / totals[month] * 100));
        })
        .sort((category1, category2) => {
            const values1 = category1.slice(1).reduce((sum, value) => sum + value, 0);
            const values2 = category2.slice(1).reduce((sum, value) => sum + value, 0);
            if (values1 > values2) {
                return -1;
            } else if (values2 > values1) {
                return 1;
            } else {
                return 0;
            }
        });
    
    columns.push(['months'].concat(orderedMonths.map(labelForMonth)));

    return {
        type: 'area',
        columns,
        x: 'months',
        groups: [columns.map(category => category[0]).reverse()],
        unload: true,
    }
}

function calculateMonthTotals(rootLevelCategories, orderedMonths) {
    const totals = {};
    Object.values(rootLevelCategories)
        .forEach(months => {
            orderedMonths.forEach(month => {
                totals[month] = (totals[month] || 0) + Math.max(0, months[month] || 0);
            });
        });
    return totals;
}

function labelForMonth(month) {
    const strMonth = String(month);
    const isoMonth = strMonth.substring(0, strMonth.length - 2) + '-' + strMonth.substring(strMonth.length - 2) + '-01';
    return formatDate(isoMonth, 'MMM YY');
}