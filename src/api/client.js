function makeOptions(options = {}) {
  return Object.assign({}, {
    credentials: 'include',
  }, options);
}

async function json(url, options = {}) {
  const response = await fetch(url, makeOptions(options));
  if (response.ok) {
    return response.json();
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

export default {
  async accounts() {
    return json('/api/accounts/');
  },

  async createAccount(account) {
    return json('/api/accounts/', {method: 'POST', body: JSON.stringify(account)});
  },

  async userProfile() {
    return json('/api/auth/');
  },

  async logout() {
    return json('/api/auth/', {method: 'DELETE'});
  },
};
