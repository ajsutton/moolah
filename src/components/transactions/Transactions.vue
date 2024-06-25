<template>
    <v-card>
        <v-app-bar flat>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <transaction-filters></transaction-filters>
            <slot name="buttons"></slot>
        </v-app-bar>
        <filter-notice></filter-notice>
        <v-alert v-model="error" type="error"
            >Failed to load transactions</v-alert
        >
        <v-divider></v-divider>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
        ></v-progress-linear>
        <v-list two-line>
            <v-list-item-group
                v-model="itemGroupSelectedTransaction"
                color="primary"
            >
                <template v-for="transaction in transactions">
                    <transaction
                        :key="transaction.id"
                        :transaction="transaction"
                        @selected="editTransaction"
                    >
                    </transaction>
                    <v-divider></v-divider>
                </template>
            </v-list-item-group>
        </v-list>
        <div class="text-sm-center">
            <v-pagination
                v-model="currentPage"
                :length="numberOfPages"
            ></v-pagination>
        </div>
    </v-card>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'pinia';
import Transaction from './Transaction.vue';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import CreateAccount from '../accounts/CreateAccount.vue';
import TransactionFilters from './TransactionFilters.vue';
import FilterNotice from './FilterNotice.vue';
import {
    useTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';
import { useRootStore, mutations as stateMutations } from '../../stores/root';

export default {
    props: {
        searchOptions: Object,
        title: {
            type: String,
            required: true,
        },
    },
    computed: {
        currentPage: {
            get() {
                return this.searchOptions.page;
            },
            async set(value) {
                this.$router.push({
                    path: this.$router.path,
                    query: Object.assign({}, this.$router.query, {
                        page: value,
                    }),
                });
            },
        },
        itemGroupSelectedTransaction: {
            get() {
                return this.highlightedTransaction;
            },
            set(transaction) {
                this.editTransaction(transaction);
            },
        },
        ...mapGetters(useRootStore, ['selectedTransaction']),
        ...mapGetters(useTransactionsStore, [
            'hasNext',
            'hasPrevious',
            'numberOfPages',
            'isFiltered',
            'loading',
            'error',
        ]),
        ...mapState(useTransactionsStore, ['transactions']),
    },
    data() {
        return {
            loadingMore: false,
            highlightedTransaction: undefined,
        };
    },
    watch: {
        selectedTransaction(transaction) {
            this.$nextTick(() => (this.highlightedTransaction = transaction));
        },
    },

    methods: {
        editTransaction(transaction) {
            if (transaction) {
                this[stateMutations.selectTransaction]({
                    id: transaction.id,
                    scheduled: false,
                });
            } else {
                this[stateMutations.selectTransaction](null);
            }
        },
        ...mapActions(useRootStore, [stateMutations.selectTransaction]),
        ...mapActions(useTransactionsStore, [transactionActions.loadPage]),
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
