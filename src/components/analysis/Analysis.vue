<template>
    <v-container fluid class="analysis">
        <v-row>
            <v-col cols="12">
                <net-worth-graph></net-worth-graph>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <upcoming-transactions :shortTerm="true"></upcoming-transactions>
                <expense-breakdown></expense-breakdown>
            </v-col>
            <v-col cols="6">
                <income-and-expense-table></income-and-expense-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <categories-over-time></categories-over-time>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import NetWorthGraph from './NetWorthGraph.vue';
    import ExpenseBreakdown from './ExpenseBreakdown.vue';
    import CategoriesOverTime from './CategoriesOverTime.vue';
    import UpcomingTransactions from '../transactions/UpcomingTransactions.vue';
    import IncomeAndExpenseTable from './IncomeAndExpenseTable.vue';

    export default {
        components: {
            NetWorthGraph,
            ExpenseBreakdown,
            CategoriesOverTime,
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
