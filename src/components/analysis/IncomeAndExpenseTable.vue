<template>
    <v-card class="income-expense-table" height="">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Monthly Income and Expense</v-toolbar-title>
        </v-toolbar>
        <v-data-table
                v-bind:headers="headers"
                :items="breakdown"
                :pagination.sync="pagination"
                :rows-per-page-items="[6, 12, 18, 24]"
                rows-per-page-text="Months per page"
                :loading="loading"
        >
            <template slot="headers" slot-scope="props">
                <tr>
                    <th v-for="header in props.headers" :key="header.text"
                        :class="['column sortable', header.classes, pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                        @click="changeSort(header.value)"
                    >
                        <v-icon>arrow_upward</v-icon>
                        {{ header.text }}
                    </th>
                </tr>
            </template>
            <template slot="items" slot-scope="props">
                <td>
                    <v-layout row-lg column>
                        <div>{{ props.item | monthsAgo}}</div>
                        <v-spacer></v-spacer>
                        <div class="grey--text">{{ props.item | monthName }}</div>
                    </v-layout>
                </td>
                <td class="text-xs-right hidden-md-and-down"><monetary-amount :value="props.item.income"></monetary-amount></td>
                <td class="text-xs-right hidden-md-and-down"><monetary-amount :value="props.item.expense"></monetary-amount></td>
                <td class="text-xs-right"><monetary-amount :value="props.item.profit"></monetary-amount></td>
                <td class="text-xs-right hidden-sm-and-down"><monetary-amount :value="props.item.cumulativeSavings"></monetary-amount></td>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import client from '../../api/client';
    import {monthAsIsoDate} from '../../api/apiFormats';
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
                        text: 'Month',
                        align: 'left',
                        sortable: true,
                        value: 'end',
                    },
                    {
                        text: 'Income',
                        align: 'right',
                        sortable: true,
                        value: 'income',
                        classes: 'hidden-md-and-down',
                    },
                    {
                        text: 'Expense',
                        align: 'right',
                        sortable: true,
                        value: 'expense',
                        classes: 'hidden-md-and-down',
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
                        classes: 'hidden-sm-and-down',
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
                const dayOfMonth = new Date().getDate();
                const endDate = parseDate(monthAsIsoDate(value.month, dayOfMonth));
                const startDate = addMonths(endDate, -1);
                const startMonth = getMonth(startDate);
                const endMonth = getMonth(endDate);
                const includeYear = differenceInCalendarMonths(new Date(), endDate) >= 12;
                const monthLabel = startMonth === endMonth ? format(startDate, 'MMM') : format(startDate, 'MMM') + '/' + format(endDate, 'MMM');
                const yearLabel = includeYear ? ' ' + format(endDate, 'YYYY') : '';
                return monthLabel + yearLabel;
            },
            monthsAgo(value) {
                const plural = value => value === 1 ? '' : 's';
                const dayOfMonth = new Date().getDate();
                const endDate = parseDate(monthAsIsoDate(value.month, dayOfMonth));
                const startDate = addMonths(endDate, -1);
                const monthsAgo = differenceInCalendarMonths(new Date(), endDate) + 1;
                if (monthsAgo === 1) {
                    return 'Last\xa0month';
                } else if (monthsAgo > 12) {
                    const yearsAgo = Math.floor(monthsAgo / 12);
                    const monthsAgoRemainer = monthsAgo % 12;
                    return monthsAgoRemainer === 0 ? `${yearsAgo}\xa0year${plural(yearsAgo)}\xa0ago` : `${yearsAgo}\xa0year${plural(yearsAgo)}, ${monthsAgoRemainer}\xa0month${plural(monthsAgoRemainer)}\xa0ago`;
                } else {
                    return `${monthsAgo}\xa0months\xa0ago`;
                }
            },
        }
    };
</script>

<style lang="scss">
    .income-expense-table {
        .datatable__actions__select {
            display: none;
        }
    }
</style>
