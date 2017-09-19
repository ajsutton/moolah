<template>
    <v-card class="expense-breakdown-graph" v-resize="handleResize">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Expense Breakdown</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
            </v-toolbar-items>
        </v-toolbar>
        <div ref="chart" class="chart"></div>
    </v-card>
</template>

<script>
    import c3 from 'c3';
    import client from '../../api/client';
    import formatMoney from '../util/formatMoney';
    import addMonths from 'date-fns/add_months';
    import {formatDate} from '../../api/apiFormats';
    import debounce from 'debounce';
    import {mapGetters, mapState} from 'vuex';
    import summariseCategories from './expenseBreakdownData';

    export default {
        data() {
            return {
                expenseBreakdown: [],
                previousMonths: 6,
                historyItems: [
                    {text: '1 Month', value: 1},
                    {text: '3 Months', value: 3},
                    {text: '6 Months', value: 6},
                    {text: '9 Months', value: 9},
                    {text: '1 Year', value: 12},
                    {text: '2 Years', value: 24},
                    {text: '3 Years', value: 36},
                    {text: '4 Years', value: 48},
                    {text: '5 Years', value: 60},
                ],
            };
        },
        computed: {
            afterDate() {
                return this.previousMonths !== 'All' ? formatDate(addMonths(new Date(), -this.previousMonths)) : undefined;
            },

            graphData() {
                return {
                    type: 'pie',
                    columns: summariseCategories(this.expenseBreakdown, this.getCategoryName, this.categoriesById),
                    unload: true,
                };
            },

            ...mapGetters('categories', ['getCategoryName']),
            ...mapState('categories', ['categoriesById'])
        },
        watch: {
            previousMonths() {
                this.update();
            },
        },
        methods: {
            getArgs() {
                return {
                    data: this.graphData,
                    padding: {
                        left: 100,
                        right: 40,
                        bottom: 10,
                    },
                    pie: {
                        label: {
                            format(value, ratio, title) {
                                return formatMoney(-value, 0);
                            },
                        },
                        expand: false,
                    },
                    legend: {
                        show: true,
                    },
                    tooltip: {
                        format:{ 
                            value(value, ratio) {
                                return `${formatMoney(-value)} (${Math.round(ratio * 100)}%)`;
                            },
                        },
                    },
                };
            },
            async update() {
                this.expenseBreakdown = await client.expenseBreakdown(this.afterDate);
                this.$chart.load(this.graphData);
            },
            reload() {
                this.$chart.unload();
                this.$nextTick(() => {
                    this.update();
                });
            },

            handleResize: debounce(function() {
                this.update();
            }, 100),
        },
        async mounted() {
            this.expenseBreakdown = await client.expenseBreakdown(this.afterDate);
            const args = this.getArgs();
            this.$chart = c3.generate({
                bindto: this.$refs.chart,
                ...args
            });
        },
        beforeDestroy() {
            this.$chart = this.$chart.destroy();
        },
    };
</script>