<template>
    <v-list-tile ripple :to="accountLink">
        <v-list-tile-action>
            <v-icon dark>{{ walletIcon }}</v-icon>
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
    import iconForType from './accountIcon';

    export default {
        props: {
            account: {
                type: Object,
                required: true,
            },
            baseUrl: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
            },
        },
        computed: {
            accountLink() {
                return `${this.baseUrl}/${encodeURIComponent(this.account.id)}/`;
            },
            walletIcon() {
                return this.icon || iconForType(this.account.type);
            },
        },
        components: {
            MonetaryAmount,
        },
    };
</script>
