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
    import iconForType from './accountIcon';

    export default {
        props: ['account'],
        computed: {
            accountLink() {
                return `/account/${encodeURIComponent(this.account.id)}/`;
            },
            icon() {
                return iconForType(this.account.type);
            },
        },
        components: {
            MonetaryAmount,
        },
    }
</script>
