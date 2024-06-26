<template>
    <v-container fluid class="analysis">
        <v-row v-if="!hasHistory">
            <v-col :cols="12">
                <getting-started></getting-started>
            </v-col>
        </v-row>

        <v-row v-if="hasHistory">
            <v-col :cols="12">
                <net-worth-graph></net-worth-graph>
            </v-col>
        </v-row>
        <v-row>
            <v-col :cols="12" :lg="6">
                <upcoming-transactions
                    v-if="showScheduledTransactions"
                    :short-term="true"
                ></upcoming-transactions>
                <expense-breakdown v-if="hasHistory"></expense-breakdown>
            </v-col>
            <v-col v-if="hasHistory" :cols="12" :lg="6">
                <income-and-expense-table></income-and-expense-table>
            </v-col>
        </v-row>
        <v-row v-if="hasHistory">
            <v-col :cols="12">
                <categories-over-time></categories-over-time>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'pinia';
import NetWorthGraph from './NetWorthGraph.vue';
import ExpenseBreakdown from './ExpenseBreakdown.vue';
import CategoriesOverTime from './CategoriesOverTime.vue';
import UpcomingTransactions from '../transactions/UpcomingTransactions.vue';
import IncomeAndExpenseTable from './IncomeAndExpenseTable.vue';
import GettingStarted from './GettingStarted.vue';
import {
    useTransactionsStore,
    useScheduledTransactionsStore,
} from '../../stores/transactions/transactionStore';
import { useAccountsStore } from '../../stores/accountsStore';

export default {
    computed: {
        bottomLayout() {
            return this.$vuetify.breakpoint.mdAndUp ? {} : { column: true };
        },
        hasHistory() {
            return this.accounts.length > 0;
        },
        showScheduledTransactions() {
            return this.hasHistory || this.scheduledTransactions.length > 0;
        },
        ...mapState(useTransactionsStore, ['transactions']),
        ...mapState(useScheduledTransactionsStore, {
            scheduledTransactions: 'transactions',
        }),
        ...mapState(useAccountsStore, ['accounts']),
    },
    components: {
        NetWorthGraph,
        ExpenseBreakdown,
        CategoriesOverTime,
        UpcomingTransactions,
        IncomeAndExpenseTable,
        GettingStarted,
    },
};
</script>

<style lang="scss">
.analysis {
    max-height: calc(100vh - 64px - 32px);
    min-height: 741px;
}
</style>
