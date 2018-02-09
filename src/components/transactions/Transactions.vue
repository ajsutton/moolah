<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">{{title}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <transaction-filters></transaction-filters>
            <template v-if="account">
                <create-account :account="account"></create-account>
                <v-btn icon
                       @click.native.stop="addTransaction">
                    <v-icon>add</v-icon>
                </v-btn>
            </template>
        </v-toolbar>
        <filter-notice></filter-notice>
        <savings-goal-notice></savings-goal-notice>
        <v-alert type="error" v-model="error">Failed to load transactions</v-alert>
        <v-divider></v-divider>
        <v-progress-linear v-bind:indeterminate="true" v-if="loading"></v-progress-linear>
        <v-list two-line>
            <template v-for="transaction in transactions">
                <transaction :transaction="transaction" :key="transaction.id" @selected="editTransaction">
                </transaction>
                <v-divider></v-divider>
            </template>
        </v-list>
        <div class="text-xs-center">
            <v-pagination :length="numberOfPages" v-model="currentPage"></v-pagination>
        </div>
    </v-card>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import client from '../../api/client';
    import Transaction from './Transaction.vue';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import CreateAccount from '../accounts/CreateAccount.vue';
    import TransactionFilters from './TransactionFilters.vue';
    import FilterNotice from './FilterNotice.vue';
    import SavingsGoalNotice from '../savings/SavingsGoalNotice.vue'
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {mutations as stateMutations} from '../../store/store';

    export default {
        props: {
            searchOptions: Object,
            account: Object,
        },
        computed: {
            title() {
                return this.account === undefined ? 'All Transactions' : this.account.name;
            },
            currentPage: {
                get() {
                    return this.searchOptions.page;
                },
                async set(value) {
                    this.$router.push({path: this.$router.path, query: Object.assign({}, this.$router.query, {page: value})});
                },
            },
            ...mapGetters('transactions', ['hasNext', 'hasPrevious', 'numberOfPages', 'isFiltered', 'loading', 'error']),
            ...mapState('transactions', ['transactions']),
        },
        data() {
            return {
                loadingMore: false,
            };
        },

        methods: {
            addTransaction() {
                this[transactionActions.addTransaction]();
            },
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, {id: transaction.id, scheduled: false});
            },
            ...mapActions('transactions', [transactionActions.addTransaction, transactionActions.loadPage]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
            TransactionFilters,
            FilterNotice,
            SavingsGoalNotice,
        },
    };
</script>
