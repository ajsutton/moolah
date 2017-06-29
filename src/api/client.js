export default {
	async accounts () {
	  return fetch('/api/accounts/')
	    .then(response => response.json());
	}
}
