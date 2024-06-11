<template>
    <div>
        <v-card class="mb-3">
            <v-app-bar flat color="accent">
                <v-toolbar-title>{{ earmarkName }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <create-earmark :earmark="selectedEarmark"></create-earmark>

                <v-tabs
                    slot="extension"
                    v-model="selectedTab"
                    slider-color="primary"
                    centered
                >
                    <v-tab href="#overview">Overview</v-tab>
                    <v-tab href="#breakdown">Spending Breakdown</v-tab>
                </v-tabs>
            </v-app-bar>
            <v-tabs-items v-model="selectedTab">
                <v-tab-item value="overview">
                    <savings-goal-notice
                        v-if="selectedEarmark !== undefined"
                        :selected-account="selectedEarmark"
                    ></savings-goal-notice>
                </v-tab-item>
                <v-tab-item value="breakdown">
                    <spending-breakdown
                        :earmark="selectedEarmark"
                    ></spending-breakdown>
                </v-tab-item>
            </v-tabs-items>
        </v-card>

        <transactions :search-options="searchOptions" title="Transactions">
            <template slot="buttons">
                <v-btn icon @click.native.stop="addTransaction">
                    <v-icon>add</v-icon>
                </v-btn>
            </template>
        </transactions>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { actions as stateActions } from '../../store/store';
import { actions as transactionActions } from '../../store/transactions/transactionStore';
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
        ...mapGetters('earmarks', { findEarmarkById: 'earmark' }),
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
        ...mapActions([stateActions.loadTransactions]),
        ...mapActions('transactions', [transactionActions.addTransaction]),
    },

    components: {
        Transactions,
        SavingsGoalNotice,
        CreateEarmark,
        SpendingBreakdown,
    },
};
</script>
