<template>
	<div>
	<v-layout row>
	<v-flex xs12 sm6 offset-sm3>
	<v-card>
	        <v-toolbar class="cyan" light>
	          <v-toolbar-side-icon light></v-toolbar-side-icon>
	          <v-toolbar-title>Accounts</v-toolbar-title>
	        </v-toolbar>
	
			<v-list two-line>
				<template v-for="account in accounts">
					<v-list-item v-bind:key="account.id">
						<v-list-tile account>
							<v-list-tile-content>
								<v-list-tile-title v-html="account.name"></v-list-tile-title>
								<v-list-tile-sub-title v-html="account.balance"></v-list-tile-sub-title>
							</v-list-tile-content>
	
						</v-list-tile>
					</v-list-item>
				</template>
				<v-list-item v-bind:key="networth">
					<v-list-tile networth>
						<v-list-tile-content>
							<v-list-tile-title>NetWorth</v-list-tile-title>
							<v-list-tile-sub-title v-html="networth"></v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
				</v-list-item>
			</v-list>
	</v-card>
	</v-flex>
	</v-layout>
	</div>
</template>

<script>
	import client from "./api/client";
	export default {
		name: "AccountList",
		data () {
			return {
				accounts: []
			}
		},
		computed: {
			networth () {
				return this.accounts.reduce((networth, account) => networth + account.balance, 0);
			}
		},
		created () {
			client.accounts().then(response => this.accounts = response.accounts)
		}
	}
</script>