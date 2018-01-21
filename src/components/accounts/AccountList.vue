<template>
    <v-list class="pt-0" dense expand>
        <v-subheader>Accounts</v-subheader>
        <account-list-item :account="account" v-for="account in standardAccounts" :key="account.id"></account-list-item>
        <v-divider></v-divider>
        <v-list-tile no-action>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Available Funds</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="networth"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>

        <v-subheader>Earmarks</v-subheader>
        <account-list-item :account="account" v-for="account in earmarkAccounts" :key="account.id"></account-list-item>
        <v-divider></v-divider>

        <v-list-tile no-action>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Net Worth</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="networthWithEarmarks"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import client from '../../api/client';
    import {actions} from '../../store/accountsStore';
    import MonetaryAmount from '../util/MonetaryAmount';
    import AccountListItem from './AccountListItem.vue';
    import {VSubheader, VDivider, VList} from 'vuetify';

    export default {
        name: 'AccountList',
        computed: {
            ...mapGetters('accounts', ['networth', 'networthWithEarmarks', 'standardAccounts', 'earmarkAccounts']),
        },
        methods: {
            ...mapActions('accounts', [actions.loadAccounts])
        },
        created() {
            this[actions.loadAccounts]();
        },
        components: {
            VList,
            VDivider,
            MonetaryAmount,
            AccountListItem,
            VSubheader,
        },
    };
</script>
