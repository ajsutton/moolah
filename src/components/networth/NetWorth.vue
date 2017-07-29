<template>
    <v-layout column>
        <v-layout row>
            <v-flex md6>
                <div class="upcoming">
                    <upcoming-transactions></upcoming-transactions>
                </div>
            </v-flex>
            <v-flex md6>
                <div class="incomeAndExpense">
                    <income-and-expense-table></income-and-expense-table>
                </div>
            </v-flex>
        </v-layout>
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
