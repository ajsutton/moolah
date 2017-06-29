function makeOptions(options = {}) {
  return Object.assign({}, {
    credentials: 'include',
  }, options);
}

async function json(url, options = {}) {
  return fetch(url, makeOptions(options))
    .then(response => response.json());
}

export default {
  async accounts() {
    return json('/api/accounts/');
  },

  async userProfile() {
    return json('/api/auth/');
  },

  async logout() {
    return json('/api/auth/', {method: 'DELETE'});
  },
};
