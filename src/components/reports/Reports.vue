<template>
    <v-card>
        <v-card-title>
            <div>Expenses by Category</div>
        </v-card-title>
        <v-form>
            <v-container fluid>
                <v-row>
                    <v-col cols="12" lg="2" offset-lg="3">
                        <v-select
                            v-model="range"
                            :items="ranges"
                            label="Date Range"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" lg="2">
                        <date-picker-field
                            v-model="from"
                            label="From"
                        ></date-picker-field>
                    </v-col>
                    <v-col cols="12" lg="2">
                        <date-picker-field
                            v-model="to"
                            label="To"
                        ></date-picker-field>
                    </v-col>
                </v-row>

                <v-row align-content="center">
                    <v-col cols="12" lg="6" offset-lg="3">
                        <expenses-by-category-report
                            :from="from"
                            :to="to"
                        ></expenses-by-category-report>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
</template>

<script>
import ExpensesByCategoryReport from './ExpensesByCategoryReport.vue';
import DatePickerField from '../util/DatePickerField.vue';
import { formatDate } from '../../api/apiFormats';
import { addMonths, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

function range(title, from, to) {
    return { title, value: { from: formatDate(from), to: formatDate(to) } };
}
export default {
    components: {
        ExpensesByCategoryReport,
        DatePickerField,
    },
    data() {
        const today = new Date();
        return {
            from: formatDate(addMonths(today, -6)),
            to: formatDate(new Date()),
            ranges: [
                range('Last month', addMonths(today, -1), today),
                range('Last 3 months', addMonths(today, -3), today),
                range('Last 6 months', addMonths(today, -6), today),
                range('Last 9 months', addMonths(today, -9), today),
                range('Last 12 months', addMonths(today, -12), today),
                range('Month to date', startOfMonth(today), today),
                range('Quarter to date', startOfQuarter(today), today),
                range('Year to date', startOfYear(today), today),
                { title: 'Custom', value: null },
            ],
        };
    },
    computed: {
        presetRange() {
            return !!this.ranges.find(range => {
                return (
                    range.value &&
                    range.value.from === this.from &&
                    range.value.to === this.to
                );
            });
        },
        range: {
            get() {
                const range = this.ranges.find(
                    range =>
                        range.value &&
                        range.value.from === this.from &&
                        range.value.to === this.to
                );
                return (range && range.value) || null;
            },
            set(value) {
                if (value) {
                    this.from = value.from;
                    this.to = value.to;
                }
            },
        },
    },
};
</script>
