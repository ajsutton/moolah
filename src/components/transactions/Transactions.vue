<template>
    <v-card>
        <v-toolbar flat>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <transaction-filters></transaction-filters>
            <slot name="buttons"></slot>
        </v-toolbar>
        <filter-notice></filter-notice>
        <v-alert v-model="error" type="error"
            >Failed to load transactions</v-alert
        >
        <v-divider></v-divider>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
        ></v-progress-linear>
        <v-list
            lines="two"
            :selectable="true"
            :selected="itemGroupSelectedTransaction"
            color="primary"
        >
            <template v-for="transaction in transactions" :key="transaction.id">
                <transaction
                    :transaction="transaction"
                    @selected="editTransaction"
                >
                </transaction>
                <v-divider></v-divider>
            </template>
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
import { mapState, mapActions } from 'pinia';
import Transaction from './Transaction.vue';
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
                return [this.highlightedTransaction];
            },
            set(transaction) {
                this.editTransaction(transaction);
            },
        },
        ...mapState(useRootStore, ['selectedTransaction']),
        ...mapState(useTransactionsStore, [
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
        Transaction,
        TransactionFilters,
        FilterNotice,
    },
};
</script>
