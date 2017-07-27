<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Monthly Income and Expense</v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
        <v-data-table
                v-bind:headers="headers"
                :items="breakdown"
                hide-actions
                class="elevation-1"
        >
            <template slot="items" scope="props">
                <td>{{ props.item.end }}</td>
                <td class="text-xs-right">{{ props.item.income }}</td>
                <td class="text-xs-right">{{ props.item.expense }}</td>
                <td class="text-xs-right">{{ props.item.profit }}</td>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    import client from '../../api/client';
    import addMonths from 'date-fns/add_months';

    export default {
        data() {
            return {
                headers: [
                    {
                        text: 'Month End',
                        align: 'left',
                        sortable: true,
                        value: 'end'
                    },
                    {
                        text: 'Income',
                        align: 'right',
                        sortable: true,
                        value: 'income',
                    },
                    {
                        text: 'Expense',
                        align: 'right',
                        sortable: true,
                        value: 'expense',
                    },
                    {
                        text: 'Savings',
                        align: 'right',
                        sortable: true,
                        value: 'profit',
                    },
                ],
                breakdown: [],
            };
        },
        async created() {
            const response = await client.incomeAndExpenseAnalsyis(addMonths(new Date(), -24), new Date().getDay());
            this.breakdown = response.incomeAndExpense;
        }
    };
</script>
