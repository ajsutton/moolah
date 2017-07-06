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
    import {mapGetters} from 'vuex';
    import client from '../../api/client';
    import MonetaryAmount from '../util/MonetaryAmount.vue';

    export default {
        props: ['accountId'],
        data() {
            return {
                transactions: [],
            };
        },
        computed: {
            title() {
                return this.accountName(this.accountId);
            },
            ...mapGetters('accounts', ['accountName'])
        },

        created() {
            this.loadTransactions(this.accountId);
        },

        watch: {
            accountId(newAccountId) {
                this.loadTransactions(newAccountId);
            }
        },

        methods: {
            async loadTransactions(accountId) {
                const response = await client.transactions(accountId);
                let currentBalance = response.priorBalance;
                this.transactions = response.transactions.map(transaction => {
                    currentBalance += transaction.amount;
                    return {...transaction, balance: currentBalance};
                });
            }
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
