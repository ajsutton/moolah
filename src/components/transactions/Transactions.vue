<template>
    <v-list two-line subheader>
        <v-subheader>{{title}}</v-subheader>
        <v-list-tile v-for="transaction in transactions" :key="transaction.id">
            <v-list-tile-content>
                <v-list-tile-title>{{transaction | transactionTitle}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="transaction.amount"></monetary-amount>
                <monetary-amount :value="transaction.balance"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {actions as stateActions} from '../../store/store';

    export default {
        props: ['accountId'],
        data() {
            return {
            };
        },
        computed: {
            title() {
                return this.accountName(this.accountId);
            },
            ...mapGetters(['selectedAccountId']),
            ...mapGetters('accounts', ['accountName']),
            ...mapState('transactions', ['transactions']),
        },

        created() {
            this.selectAccount(this.accountId);
        },

        watch: {
            accountId(newAccountId) {
                this.selectAccount(newAccountId);
            }
        },

        methods: {
            async selectAccount(accountId) {
                this[stateActions.selectAccount](accountId);
            },
            ...mapActions([stateActions.selectAccount]),
        },

        filters: {
            transactionTitle(transaction) {
                if (transaction.type === 'openingBalance') {
                    return 'Opening Balance';
                } else {
                    return transaction.payee;
                }
            }
        },

        components: {
            MonetaryAmount
        }
    };
</script>
