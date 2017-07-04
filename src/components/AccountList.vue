<template>
    <v-list class="pt-0" dense>
        <v-divider></v-divider>
            <v-list-tile avatar ripple :href="accountLink(account)" :router="true"  v-for="account in accounts" :key="account.id">
                <v-list-tile-action>
                    <v-icon light>{{ icon(account.type) }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>{{ account.name }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <monetary-amount :value="account.balance"></monetary-amount>
                </v-list-tile-action>
            </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile avatar ripple href="/" :router="true">
            <v-list-tile-action>
                <v-icon light>trending_up</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Net Worth</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="networth"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import client from '@/api/client';
    import MonetaryAmount from '@/components/util/MonetaryAmount';
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
        methods: {
            icon(type) {
                switch (type) {
                    case 'cc':
                        return 'credit_card';
                    case 'asset':
                        return 'home';
                    default:
                        return 'account_balance';
                }
            },
            accountLink(account) {
                return `/account/${encodeURIComponent(account.id)}/`;
            }
        },
        created () {
            client.accounts().then(response => this.accounts = response.accounts)
        },
        components: {
            MonetaryAmount
        }
    }
</script>
