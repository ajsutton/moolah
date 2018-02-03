<template>
    <v-list class="pt-0" dense expand>
        <v-subheader>
            <v-list-tile-content>{{title}}</v-list-tile-content>
            <v-list-tile-action>
                <create-account dark></create-account>
            </v-list-tile-action>
        </v-subheader>
        <account-list-item :account="account" v-for="account in accounts" :key="account.id"></account-list-item>
        <v-divider></v-divider>

        <v-list-tile no-action>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{totalLabel}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="totalValue"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount';
    import AccountListItem from './AccountListItem.vue';
    import {VSubheader, VDivider, VList} from 'vuetify';
    import CreateAccount from './CreateAccount';

    export default {
        props: {
            title: {
                type: String,
                required: true,
            },
            totalLabel: {
                type: String,
                required: true,
            },
            accounts: {
                type: Array,
                required: true,
            },
            totalValue: {
                type: Number,
                required: true,
            },
        },
        components: {
            VList,
            VDivider,
            MonetaryAmount,
            AccountListItem,
            VSubheader,
            CreateAccount,
        },
    };
</script>
