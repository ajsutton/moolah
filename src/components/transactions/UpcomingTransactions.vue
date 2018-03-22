<template>
    <v-card class="upcoming-transactions">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Upcoming Transactions</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon
                   @click.native.stop="addEarmark" :disabled="noEarmarks">
                <v-icon>bookmark_outline</v-icon>
            </v-btn>
            <v-btn icon
                   @click.native.stop="addTransaction" :disabled="noAccounts">
                <v-icon>add</v-icon>
            </v-btn>
        </v-toolbar>
        <v-progress-linear v-bind:indeterminate="true" v-if="loading"></v-progress-linear>
        <v-list two-line>
            <template v-for="transaction in transactionsToDisplay">
                <transaction :transaction="transaction" :key="transaction.id" @selected="editTransaction" :showBalance="false" highlightOverdue>
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
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import AddTransactionMixin from '../util/AddTransactionMixin';

    export default {
        props: {
            height: {
                'default': '',
            },
            shortTerm: {
                type: Boolean,
                'default': false,
            },
        },
        data() {
            return {};
        },
        mixins: [AddTransactionMixin],
        computed: {
            noAccounts() {
                return this.accounts.length === 0;
            },
            noEarmarks() {
                return this.earmarks.length === 0;
            },
            transactionsToDisplay() {
                return this.shortTerm
                    ? this.transactions.filter(transaction => differenceInCalendarDays(transaction.date, new Date()) < 14)
                    : this.transactions;
            },
            ...mapState('scheduledTransactions', ['transactions', 'loading']),
            ...mapState('accounts', ['accounts']),
            ...mapState('earmarks', ['earmarks']),
        },

        methods: {
            addTransaction() {
                this[transactionActions.addTransaction]({recurEvery: null, recurPeriod: 'ONCE'});
            },
            addEarmark() {
                this[transactionActions.addTransaction]({earmark: this.earmarks[0].id, accountId: undefined, type: 'income', recurEvery: null, recurPeriod: 'ONCE'});
            },
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, {id: transaction.id, scheduled: true});
            },
            ...mapActions([stateActions.showUpcoming]),
            ...mapActions('scheduledTransactions', [transactionActions.addTransaction]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
        },
    };
</script>

<style lang="scss">
    .upcoming-transactions {
        overflow-y: auto;
    }
</style>
