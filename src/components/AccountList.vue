<template>
    <v-list class="pt-0" dense>
        <v-divider></v-divider>
            <v-list-tile avatar ripple :href="accountLink(account)" :router="true"  v-for="account in accounts" :key="account.id">
                <v-list-tile-action>
                    <v-icon dark>{{ icon(account.type) }}</v-icon>
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
                <v-icon dark>trending_up</v-icon>
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
    import { mapState, mapGetters, mapActions } from 'vuex';
    import client from '../api/client';
    import {actions} from '../store/accountsStore';
    import MonetaryAmount from './util/MonetaryAmount';
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
            },
            ...mapActions('accounts', [actions.loadAccounts])
        },
        created () {
            this[actions.loadAccounts]();
        },
        components: {
            MonetaryAmount
        }
    }
</script>
