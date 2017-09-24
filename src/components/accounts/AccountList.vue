<template>
    <v-list class="pt-0" dense>
        <v-divider></v-divider>
            <account-list-item :account="account" v-for="account in accounts" :key="account.id">
            </account-list-item>
        <v-divider></v-divider>
        <v-list-tile ripple to="/transactions/">
            <v-list-tile-action>
                <v-icon dark>list</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>All Transactions</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="networth"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import client from '../../api/client';
    import {actions} from '../../store/accountsStore';
    import MonetaryAmount from '../util/MonetaryAmount';
    import AccountListItem from './AccountListItem.vue';
    export default {
        name: "AccountList",
        data () {
            return {
            }
        },
        computed: {
            ...mapState('accounts', ['accounts']),
            ...mapGetters('accounts', ['networth']),
        },
        methods: {
            ...mapActions('accounts', [actions.loadAccounts])
        },
        created () {
            this[actions.loadAccounts]();
        },
        components: {
            MonetaryAmount,
            AccountListItem
        }
    }
</script>
