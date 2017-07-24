<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Upcoming Transactions</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon
                   @click.native.stop="addTransaction">
                <v-icon>add</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
            <v-list two-line style="position: relative">
                <template v-for="transaction in transactions">
                    <transaction :transaction="transaction" :key="transaction.id">
                    </transaction>
                    <v-divider></v-divider>
                </template>
            </v-list>
    </v-card>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import Transaction from './Transaction.vue';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import CreateAccount from '../accounts/CreateAccount.vue';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';

    export default {
        data() {
            return {};
        },
        computed: {
            ...mapState('transactions', ['transactions']),
        },

        created() {
            this[stateActions.showUpcoming]();
        },

        watch: {
            accountId(newAccountId) {
                this.selectAccount(newAccountId);
            }
        },

        methods: {
            addTransaction() {
                this[transactionActions.addTransaction]({recurEvery: 1, recurPeriod: 'MONTH'});
            },
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, transaction.id);
            },
            ...mapActions([stateActions.showUpcoming]),
            ...mapActions('transactions', [transactionActions.addTransaction]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
        }
    };
</script>
