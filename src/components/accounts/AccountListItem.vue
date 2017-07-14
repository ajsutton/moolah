<template>
    <v-list-tile avatar ripple :to="accountLink">
        <v-list-tile-action>
            <v-icon dark>{{ icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>{{ account.name }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <monetary-amount :value="account.balance"></monetary-amount>
        </v-list-tile-action>
    </v-list-tile>
</template>

<script>
    import MonetaryAmount from '../util/MonetaryAmount';
    export default {
        props: ['account'],
        computed: {
            accountLink() {
                return `/account/${encodeURIComponent(this.account.id)}/`;
            },
            icon() {
                switch (this.account.type) {
                    case 'cc':
                        return 'credit_card';
                    case 'asset':
                        return 'home';
                    default:
                        return 'account_balance';
                }
            },
        },
        components: {
            MonetaryAmount,
        },
    }
</script>