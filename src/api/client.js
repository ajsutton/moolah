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

    async transactions(accountId, offset = 0, pageSize = 500) {
        return json(`/api/transactions/?account=${encodeURIComponent(accountId)}&offset=${offset}&pageSize=${pageSize}`);
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
        return json('/api/categories/', {method: 'POST', body: JSON.stringify(category)});
    },

    async updateCategory(category) {
        return json(`/api/categories/${encodeURIComponent(category.id)}/`, {method: 'PUT', body: JSON.stringify(category)});
    },

    async userProfile() {
        return json('/api/auth/');
    },

    async logout() {
        return json('/api/auth/', {method: 'DELETE'});
    },
};
