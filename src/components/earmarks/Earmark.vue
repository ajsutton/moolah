<template>
    <div>
        <v-card class="mb-3">
            <v-toolbar flat color="accent">
                <v-toolbar-title>{{ earmarkName }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <create-earmark :earmark="selectedEarmark"></create-earmark>

                <template v-slot:extension>
                    <v-tabs
                        v-model="selectedTab"
                        slider-color="primary"
                        align-tabs="center"
                    >
                        <v-tab value="overview">Overview</v-tab>
                        <v-tab value="breakdown">Spending Breakdown</v-tab>
                    </v-tabs>
                </template>
            </v-toolbar>
            <v-tabs-window v-model="selectedTab">
                <v-window-item value="overview">
                    <savings-goal-notice
                        v-if="selectedEarmark !== undefined"
                        :selected-account="selectedEarmark"
                    ></savings-goal-notice>
                </v-window-item>
                <v-window-item value="breakdown">
                    <spending-breakdown
                        :earmark="selectedEarmark"
                    ></spending-breakdown>
                </v-window-item>
            </v-tabs-window>
        </v-card>

        <transactions :search-options="searchOptions" title="Transactions">
            <template v-slot:buttons>
                <v-btn icon @click.stop="addTransaction">
                    <v-icon :icon="IconAdd"></v-icon>
                </v-btn>
            </template>
        </transactions>
    </div>
</template>

<script setup>
import IconAdd from '~icons/mdi/add';
</script>

<script>
import { mapState, mapActions } from 'pinia';
import { useRootStore, actions as stateActions } from '../../stores/root';
import {
    useTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';
import { useEarmarksStore } from '../../stores/earmarksStore';
import Transactions from '../transactions/Transactions.vue';
import SavingsGoalNotice from './SavingsGoalNotice.vue';
import CreateEarmark from './CreateEarmark.vue';
import AddTransactionMixin from '../util/AddTransactionMixin';
import SpendingBreakdown from './SpendingBreakdown.vue';

export default {
    mixins: [AddTransactionMixin],
    props: {
        earmarkId: String,
        searchOptions: Object,
    },

    data() {
        return {
            selectedTab: 'overview',
        };
    },

    watch: {
        $route() {
            this.loadTransactions();
        },
    },

    created() {
        this.loadTransactions();
    },

    computed: {
        selectedEarmark() {
            return this.findEarmarkById(this.earmarkId);
        },
        earmarkName() {
            return this.selectedEarmark ? this.selectedEarmark.name : '';
        },
        ...mapState(useEarmarksStore, { findEarmarkById: 'earmark' }),
    },

    methods: {
        async loadTransactions() {
            await this[stateActions.loadTransactions](this.searchOptions);
        },
        addTransaction() {
            this[transactionActions.addTransaction]({
                earmark: this.earmarkId,
                accountId: undefined,
                type: 'income',
            });
        },
        ...mapActions(useRootStore, [stateActions.loadTransactions]),
        ...mapActions(useTransactionsStore, [
            transactionActions.addTransaction,
        ]),
    },

    components: {
        Transactions,
        SavingsGoalNotice,
        CreateEarmark,
        SpendingBreakdown,
    },
};
</script>
