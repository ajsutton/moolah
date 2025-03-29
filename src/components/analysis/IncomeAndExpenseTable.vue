<template>
    <v-card class="income-expense-table">
        <v-toolbar>
            <v-toolbar-title>Monthly Income & Expense</v-toolbar-title>
            <v-toolbar-items>
                <v-checkbox
                    v-model="includeEarmarks"
                    label="Earmarked funds"
                    class="mt-2 me-4"
                ></v-checkbox>
            </v-toolbar-items>
        </v-toolbar>
        <v-data-table
            :headers="headers"
            :items="tableItems"
            :sort-by="[{ key: 'end' }]"
            disable-sort
            :mobile-breakpoint="0"
            :descending="true"
            :loading="loading"
            :items-per-page-options="[6, 12, 18, 24]"
            items-per-page-text="Months per page"
            :items-per-page="12"
        >
            <template v-slot:item.end="{ item }">
                <div>{{ monthsAgo(item) }}</div>
                <v-spacer></v-spacer>
                <div class="text-grey">
                    {{ monthName(item) }}
                </div>
            </template>
            <template v-slot:item.income="{ item }">
                <monetary-amount :value="item.income"></monetary-amount>
            </template>
            <template v-slot:item.expense="{ item }">
                <monetary-amount :value="item.expense"></monetary-amount>
            </template>
            <template v-slot:item.profit="{ item }">
                <monetary-amount :value="item.profit"></monetary-amount>
            </template>
            <template v-slot:item.cumulativeSavings="{ item }">
                <monetary-amount
                    :value="item.cumulativeSavings"
                ></monetary-amount>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import MonetaryAmount from '../util/MonetaryAmount.vue';
import client from '../../api/client';
import { monthAsIsoDate } from '../../api/apiFormats';
import {
    addMonths,
    format,
    getMonth,
    differenceInCalendarMonths,
} from 'date-fns';

export default {
    components: { MonetaryAmount },

    methods: {
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
    data() {
        return {
            headers: [
                {
                    title: 'Month',
                    align: 'start',
                    sortable: true,
                    value: 'end',
                },
                {
                    title: 'Income',
                    align: 'end',
                    sortable: true,
                    value: 'income',
                    classes: 'hidden-md-and-down',
                },
                {
                    title: 'Expense',
                    align: 'end',
                    sortable: true,
                    value: 'expense',
                    classes: 'hidden-md-and-down',
                },
                {
                    title: 'Savings',
                    align: 'end',
                    sortable: true,
                    value: 'profit',
                },
                {
                    title: 'Total Savings',
                    align: 'end',
                    sortable: true,
                    value: 'cumulativeSavings',
                    classes: 'hidden-sm-and-down',
                },
            ],
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
};
</script>

<style lang="scss">
.income-expense-table {
    .datatable__actions__select {
        display: none;
    }
}
</style>
