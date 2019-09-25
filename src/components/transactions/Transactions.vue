<template>
    <v-card>
        <v-app-bar flat>
            <v-toolbar-title>{{title}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <transaction-filters></transaction-filters>
            <slot name="buttons"></slot>
        </v-app-bar>
        <filter-notice></filter-notice>
        <v-alert type="error" v-model="error">Failed to load transactions</v-alert>
        <v-divider></v-divider>
        <v-progress-linear v-bind:indeterminate="true" v-if="loading"></v-progress-linear>
        <v-list two-line>
            <v-list-item-group v-model="selectedTransactionIndex" color="primary">
                <template v-for="transaction in transactions">
                    <transaction :transaction="transaction" :key="transaction.id" @selected="editTransaction">
                    </transaction>
                    <v-divider></v-divider>
                </template>
            </v-list-item-group>
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
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {mutations as stateMutations} from '../../store/store';

    export default {
        props: {
            searchOptions: Object,
            title: {
                type: String,
                required: true,
            }
        },
        computed: {
            currentPage: {
                get() {
                    return this.searchOptions.page;
                },
                async set(value) {
                    this.$router.push({path: this.$router.path, query: Object.assign({}, this.$router.query, {page: value})});
                },
            },
            selectedTransactionIndex: {
                get() {
                    return this.transactions.findIndex(tx => tx == this.selectedTransaction);
                },
                set(index) {
                    this.editTransaction(this.transactions[index]);
                }
            },
            ...mapGetters(['selectedTransaction']),
            ...mapGetters('transactions', ['hasNext', 'hasPrevious', 'numberOfPages', 'isFiltered', 'loading', 'error']),
            ...mapState('transactions', ['transactions']),
        },
        data() {
            return {
                loadingMore: false,
            };
        },

        methods: {
            editTransaction(transaction) {
                if (transaction) {
                    this.$store.commit(stateMutations.selectTransaction, {id: transaction.id, scheduled: false});
                }
            },
            ...mapActions('transactions', [transactionActions.loadPage]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
            TransactionFilters,
            FilterNotice,
        },
    };
</script>
