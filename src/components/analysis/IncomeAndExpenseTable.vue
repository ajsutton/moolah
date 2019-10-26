<template>
    <v-card class="income-expense-table" height="">
        <v-app-bar flat>
            <v-toolbar-title class="body-2 grey--text"
                >Monthly Income and Expense</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-switch
                    label="Earmarked funds"
                    v-model="includeEarmarks"
                    style="min-width: 13em; margin-top: 16px;"
                ></v-switch>
            </v-toolbar-items>
        </v-app-bar>
        <v-data-table
            v-bind:headers="headers"
            :items="tableItems"
            sort-by="end"
            disable-sort
            :mobile-breakpoint="0"
            :descending="true"
            :loading="loading"
            :footer-props="footerProps"
            :items-per-page="12"
        >
            <template v-slot:body="{ items }">
                <tbody>
                    <tr v-for="item in items" :key="item.name">
                        <td>
                            <v-layout row-lg column>
                                <div>{{ item | monthsAgo }}</div>
                                <v-spacer></v-spacer>
                                <div class="grey--text">
                                    {{ item | monthName }}
                                </div>
                            </v-layout>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount
                                :value="item.income"
                            ></monetary-amount>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount
                                :value="item.expense"
                            ></monetary-amount>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount
                                :value="item.profit"
                            ></monetary-amount>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount
                                :value="item.cumulativeSavings"
                            ></monetary-amount>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import MonetaryAmount from '../util/MonetaryAmount.vue';
import client from '../../api/client';
import { monthAsIsoDate } from '../../api/apiFormats';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import getMonth from 'date-fns/getMonth';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { VCheckbox } from 'vuetify';

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
            footerProps: {
                'items-per-page-text': 'Months per page',
                'items-per-page-options': [6, 12, 18, 24],
            },
            breakdown: [],
            includeEarmarks: false,
            loading: true,
        };
    },
    computed: {
        tableItems() {
            const applyEarmark = (value, earmarkedValue) =>
                this.includeEarmarks ? value : value - earmarkedValue;
            return this.breakdown.map(data => ({
                income: applyEarmark(data.income, data.earmarkedIncome),
                expense: applyEarmark(data.expense, data.earmarkedExpense),
                profit: applyEarmark(data.profit, data.earmarkedProfit),
                cumulativeSavings: applyEarmark(
                    data.cumulativeSavings,
                    data.cumulativeEarmarkedSavings
                ),
                month: data.month,
                start: data.start,
                end: data.end,
            }));
        },
    },
    async created() {
        const response = await client.incomeAndExpenseAnalsyis(
            new Date().getDate()
        );
        let cumulativeSavings = 0;
        let cumulativeEarmarkedSavings = 0;
        this.breakdown = response.incomeAndExpense.reverse().map(row => {
            cumulativeSavings += row.profit;
            cumulativeEarmarkedSavings += row.earmarkedProfit;
            row.cumulativeSavings = cumulativeSavings;
            row.cumulativeEarmarkedSavings = cumulativeEarmarkedSavings;
            return row;
        });
        this.loading = false;
    },

    components: {
        MonetaryAmount,
        VCheckbox,
    },

    filters: {
        monthName(value) {
            const dayOfMonth = new Date().getDate();
            const endDate = monthAsIsoDate(value.month, dayOfMonth);
            const startDate = addMonths(endDate, -1);
            const startMonth = getMonth(startDate);
            const endMonth = getMonth(endDate);
            const includeYear =
                differenceInCalendarMonths(new Date(), endDate) >= 12;
            const monthLabel =
                startMonth === endMonth
                    ? format(startDate, 'MMM')
                    : format(startDate, 'MMM') + '/' + format(endDate, 'MMM');
            const yearLabel = includeYear ? ' ' + format(endDate, 'yyyy') : '';
            return monthLabel + yearLabel;
        },
        monthsAgo(value) {
            const plural = value => (value === 1 ? '' : 's');
            const dayOfMonth = new Date().getDate();
            const endDate = monthAsIsoDate(value.month, dayOfMonth);
            const startDate = addMonths(endDate, -1);
            const monthsAgo =
                differenceInCalendarMonths(new Date(), endDate) + 1;
            if (monthsAgo === 1) {
                return 'Last\xa0month';
            } else if (monthsAgo > 12) {
                const yearsAgo = Math.floor(monthsAgo / 12);
                const monthsAgoRemainer = monthsAgo % 12;
                return monthsAgoRemainer === 0
                    ? `${yearsAgo}\xa0year${plural(yearsAgo)}\xa0ago`
                    : `${yearsAgo}\xa0year${plural(
                          yearsAgo
                      )}, ${monthsAgoRemainer}\xa0month${plural(
                          monthsAgoRemainer
                      )}\xa0ago`;
            } else {
                return `${monthsAgo}\xa0months\xa0ago`;
            }
        },
    },
};
</script>

<style lang="scss">
.income-expense-table {
    .datatable__actions__select {
        display: none;
    }
}
</style>
