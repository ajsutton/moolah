import {formatDate} from './apiFormats';

function makeOptions(options = {}) {
    return Object.assign({}, {
        credentials: 'include',
    }, options);
}

async function request(url, options = {}) {
    const response = await fetch(url, makeOptions(options));
    if (response.ok) {
        return response;
    } else {
        let errorResponse;
        try {
            errorResponse = await response.json();
        } catch (error) {
            errorResponse = 'An unknown error occurred.';
        }
        throw errorResponse;
    }
}

async function json(url, options = {}) {
    const response = await(request(url, options));
    return response.json();
}

function asQueryParams(args) {
    return Object.entries(args)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
}

export default {
    async accounts() {
        return json('/api/accounts/');
    },

    async createAccount(account) {
        return json('/api/accounts/', {method: 'POST', body: JSON.stringify(account)});
    },

    async updateAccount(account) {
        return json(`/api/accounts/${encodeURIComponent(account.id)}/`, {method: 'PUT', body: JSON.stringify(account)});
    },

    async transactions(searchOptions, offset = 0, pageSize = 100) {
        const options = [`offset=${offset}`, `pageSize=${pageSize}`];
        Object.entries(searchOptions)
            .filter(([key, value]) => value !== undefined && value !== null)
            .forEach(([key, value]) => options.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)));
        return json(`/api/transactions/?${options.join('&')}`);
    },

    async createTransaction(transaction) {
        return json(`/api/transactions/`, {method: 'POST', body: JSON.stringify(transaction)});
    },

    async updateTransaction(transaction) {
        return json(`/api/transactions/${encodeURIComponent(transaction.id)}/`, {method: 'PUT', body: JSON.stringify(transaction)});
    },

    async deleteTransaction(transaction) {
        return request(`/api/transactions/${encodeURIComponent(transaction.id)}/`, {method: 'DELETE'});
    },

    async categories() {
        return json('/api/categories/');
    },

    async createCategory(category) {
        const data = {name: category.name};
        if (category.parentId !== null) {
            data.parentId = category.parentId;
        }
        return json('/api/categories/', {method: 'POST', body: JSON.stringify(data)});
    },

    async updateCategory(category) {
        return json(`/api/categories/${encodeURIComponent(category.id)}/`, {method: 'PUT', body: JSON.stringify(category)});
    },

    async incomeAndExpenseAnalsyis(monthEnd, afterDate) {
        const afterParam = afterDate ? `&after=${encodeURIComponent(formatDate(afterDate))}` : '';
        return json(`/api/analysis/incomeAndExpense/?monthEnd=${encodeURIComponent(monthEnd)}${afterParam}`);
    },

    async dailyBalances(afterDate, untilDate) {
        const params = asQueryParams({after: formatDate(afterDate), forecastUntil: formatDate(untilDate)});
        return json(`/api/analysis/dailyBalances/?${params}`);
    },

    async userProfile() {
        return json('/api/auth/');
    },

    async logout() {
        return json('/api/auth/', {method: 'DELETE'});
    },
};
