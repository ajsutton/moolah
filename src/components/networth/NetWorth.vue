<template>
    <v-layout row-md column class="analysis">
        <v-flex md6>
            <upcoming-transactions height="100%"></upcoming-transactions>
        </v-flex>
        <v-flex md6>
            <income-and-expense-table></income-and-expense-table>
        </v-flex>
    </v-layout>
</template>

<script>
    import UpcomingTransactions from '../transactions/UpcomingTransactions.vue';
    import IncomeAndExpenseTable from './IncomeAndExpenseTable.vue';

    export default {
        components: {
            UpcomingTransactions,
            IncomeAndExpenseTable,
        }
    }
</script>

<style lang="scss">
    .analysis {
        max-height: calc(100vh - 64px - 32px);
        min-height: 741px;
    }
</style>
