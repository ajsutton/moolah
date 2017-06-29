function options(options = {}) {
	return Object.assign({}, {
		credentials: 'include',
	}, options);
}

export default {
	async accounts() {
		return fetch('/api/accounts/', options())
	    .then(response => response.json());
	},

	async userProfile() {
		return fetch('/api/auth/', options())
			.then(response => response.json());
	},
}
