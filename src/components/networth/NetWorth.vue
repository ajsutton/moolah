<template>
    <v-layout column class="analysis">
        <v-flex xs12 class="mb-4">
            <net-worth-graph></net-worth-graph>
        </v-flex>
        <v-flex xs12>
            <v-layout v-bind="bottomLayout">
                <v-flex md6>
                    <upcoming-transactions height="100%" :shortTerm="true"></upcoming-transactions>
                </v-flex>
                <v-flex md6>
                    <income-and-expense-table></income-and-expense-table>
                </v-flex>
            </v-layout>
        </v-flex>
        <v-flex xs12>
            <v-flex md6>
                <expense-breakdown></expense-breakdown>
            </v-flex>
        </v-flex>
    </v-layout>
</template>

<script>
    import NetWorthGraph from './NetWorthGraph.vue';
    import ExpenseBreakdown from './ExpenseBreakdown';
    import UpcomingTransactions from '../transactions/UpcomingTransactions.vue';
    import IncomeAndExpenseTable from './IncomeAndExpenseTable.vue';

    export default {
        components: {
            NetWorthGraph,
            ExpenseBreakdown,
            UpcomingTransactions,
            IncomeAndExpenseTable,
        },

        computed: {
            bottomLayout() {
                return this.$vuetify.breakpoint.mdAndUp ? {}  : {column: true};
            },
        },
    };
</script>

<style lang="scss">
    .analysis {
        max-height: calc(100vh - 64px - 32px);
        min-height: 741px;
    }
</style>
