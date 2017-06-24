export default {
	async accounts () {
		return {
			accounts: [
				{id : "111111", name : "Account1", type : "bank", balance : 500000},
				{id : "222222", name : "Account2", type : "cc", balance : -200000}
			]
		}
	}
}