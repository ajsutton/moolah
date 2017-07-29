<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Monthly Income and Expense</v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
        <v-data-table
                v-bind:headers="headers"
                :items="breakdown"
                :pagination.sync="pagination"
                :rows-per-page-items="[6, 12, 18, 24]"
                rows-per-page-text="Months per page"
                class="elevation-1"
                :loading="loading"
        >
            <template slot="items" scope="props">
                <td>
                    <v-layout row-lg column>
                        <div>{{ props.item | monthsAgo}}</div>
                        <v-spacer></v-spacer>
                        <div class="grey--text">{{ props.item | monthName }}</div>
                    </v-layout>
                </td>
                <td class="text-xs-right"><monetary-amount :value="props.item.income"></monetary-amount></td>
                <td class="text-xs-right"><monetary-amount :value="props.item.expense"></monetary-amount></td>
                <td class="text-xs-right"><monetary-amount :value="props.item.profit"></monetary-amount></td>
                <td class="text-xs-right"><monetary-amount :value="props.item.cumulativeSavings"></monetary-amount></td>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import client from '../../api/client';
    import addMonths from 'date-fns/add_months';
    import parseDate from 'date-fns/parse';
    import format from 'date-fns/format';
    import getMonth from 'date-fns/get_month';
    import differenceInCalendarMonths from 'date-fns/difference_in_calendar_months';

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
                    {
                        text: 'Total Savings',
                        align: 'right',
                        sortable: true,
                        value: 'cumulativeSavings',
                    },
                ],
                breakdown: [],
                pagination: {
                    sortBy: 'end',
                    descending: true,
                    rowsPerPage: 12,
                },
                loading: true,
            };
        },
        async created() {
            const response = await client.incomeAndExpenseAnalsyis(new Date().getDate());
            let cumulativeSavings = 0;
            this.breakdown = response.incomeAndExpense.reverse().map(row => {
                cumulativeSavings += row.profit;
                row.cumulativeSavings = cumulativeSavings;
                return row;
            });
            this.loading = false;
        },

        components: {
            MonetaryAmount
        },

        filters: {
            monthName(value) {
                const startDate = parseDate(value.start);
                const endDate = parseDate(value.end);
                const startMonth = getMonth(startDate);
                const endMonth = getMonth(endDate);
                return startMonth === endMonth ? format(startDate, 'MMM') : format(startDate, 'MMM') + '/' + format(endDate, 'MMM');
            },
            monthsAgo(value) {

                const startDate = parseDate(value.start);
                const endDate = parseDate(value.end);
                const monthsAgo = differenceInCalendarMonths(new Date(), endDate) + 1;
                return monthsAgo === 1 ? 'Last month' : monthsAgo + ' months ago';
            },
            monthEnd(value) {
                const startDate = parseDate(value.start);
                const endDate = parseDate(value.end);
                const startMonth = getMonth(startDate);
                const endMonth = getMonth(endDate);
                const monthName = startMonth === endMonth ? format(startDate, 'MMM') : format(startDate, 'MMM') + '/' + format(endDate, 'MMM');
                const monthsAgo = differenceInCalendarMonths(new Date(), endDate) + 1;
                const monthsAgoLabel = monthsAgo === 1 ? 'Last month' : monthsAgo + ' months ago';
                return `${monthName} (${monthsAgoLabel})`;
            }
        }
    };
</script>

<style scoped>
    .month-name {
        float: right;
        color: #9e9e9e;
    }
</style>
