<template>
    <v-card class="expense-category-time-graph" v-resize="handleResize">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Expenses by Category Over Time</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-radio-group row v-model="actualValues">
                <v-radio label="Percentage" :value="false" ></v-radio>
                <v-radio label="Actual" :value="true"></v-radio>
            </v-radio-group>
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
    import {categoriesOverTimeGraphData} from './categories/categoryOverTimeData';

    export default {
        data() {
            return {
                expenseBreakdown: [],
                rootCategoryId: null,
                previousMonths: 24,
                actualValues: false,
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
                    {text: 'All', value: 'All'},
                ],
            };
        },
        computed: {
            afterDate() {
                return this.previousMonths !== 'All' ? formatDate(addMonths(new Date(), -this.previousMonths)) : undefined;
            },

            graphData() {
                return categoriesOverTimeGraphData(this.expenseBreakdown, this.actualValues, this.getCategoryName, this.categoriesById);
            },

            ...mapGetters('categories', ['getCategoryName']),
            ...mapState('categories', ['categoriesById'])
        },
        watch: {
            actualValues() {
                this.$chart.destroy();
                const args = this.getArgs();
                this.$chart = c3.generate({
                    bindto: this.$refs.chart,
                    ...args
                });
            },
            previousMonths() {
                this.update();
            },
            rootCategoryId() {
                this.update();
            },
        },
        methods: {
            getArgs() {
                const actualValues = this.actualValues;
                return {
                    data: this.graphData,
                    axis: {
                        x: {
                            type: 'category',
                            padding: 0,
                            tick: {
                                culling: true,
                                centered: true,
                                outer: false,
                                multiline: false,
                            }
                        },
                        y: {
                            show: true,
                            min: actualValues ? undefined : 0,
                            max: actualValues ? undefined : 100,
                            padding: 0,
                            tick: {
                                format: value => actualValues ? formatMoney(value) : value + '%',
                            }
                        },
                    },
                    padding: {
                        left: actualValues ? 100 : 50,
                        right: 10,
                        bottom: 10,
                        top: 10,
                    },
                    legend: {
                        show: true,
                    },
                    tooltip: {
                        show: false,
                        format:{ 
                            value(value, ratio) {
                                return `${formatMoney(value)}`;
                            },
                        },
                    },
                    point: {
                        show: false,
                    },
                };
            },
            async update() {
                this.expenseBreakdown = await client.expenseBreakdown(new Date().getDate(), this.afterDate);
                this.$chart.load(this.graphData);
            },
            reload() {
                if (this.$chart) {
                    this.$chart.unload();
                    this.$nextTick(() => {
                        this.$chart.load(this.graphData);
                    });
                }
            },

            handleResize: debounce(function() {
                this.reload();
            }, 100),
        },
        async mounted() {
            this.expenseBreakdown = await client.expenseBreakdown(new Date().getDate(), this.afterDate);
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

<style lang="scss">
    @import "~c3/c3.css";

    .expense-category-time-graph {
        .input-group--select {
            min-width: 10em;
        }

        .chart {
            height: 500px;
            .c3-line {
                stroke-width: 0;
            }

            .c3-area {
                opacity: 0.8 !important;
            }
        }
    }
</style>