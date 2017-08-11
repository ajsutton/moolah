<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Net Worth</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-select label="History" :items="items" v-model="previousMonths"></v-select>
                <v-select label="Forecast" :items="items" v-model="forecastMonths"></v-select>
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
    import extrapolateBalances from './netWorthGraphData';

    export default {
        data() {
            return {
                dailyBalances: [],
                scheduledBalances: [],
                items: [
                    {text: '1 Month', value: 1},
                    {text: '3 Months', value: 3},
                    {text: '6 Months', value: 6},
                    {text: '9 Months', value: 9},
                    {text: '1 Year', value: 12},
                    {text: '2 Years', value: 24},
                    {text: '3 Years', value: 36},
                    {text: '4 Years', value: 48},
                    {text: '5 Years', value: 60},
                    {text: 'All', value: null},
                ],
                today: formatDate(new Date()),
                previousMonths: 6,
                forecastMonths: 1,
            };
        },
        computed: {
            extrapolatedBalances() {
                return extrapolateBalances(this.dailyBalances, this.scheduledBalances, this.today, this.untilDate);
            },
            graphData() {
                return {
                    type: 'step',
                    json: this.extrapolatedBalances,
                    keys: {
                        x: 'date',
                        value: ['balance', 'scheduled'],
                    },
                    names: {
                        balance: 'Actual Net Worth',
                        scheduled: 'Scheduled Net Worth',
                    },
                    colors: {
                        'balance': 'green',
                        'scheduled': 'gray',
                    },
                };
            },
            afterDate() {
                return this.previousMonths !== null ? formatDate(addMonths(new Date(), -this.previousMonths)) : undefined;
            },
            untilDate() {
                return this.forecastMonths !== null ? formatDate(addMonths(new Date(), this.forecastMonths)) : undefined;
            },
        },
        watch: {
            previousMonths() {
                this.update();
            },
            forecastMonths() {
                this.update();
            },
        },
        methods: {
            getArgs() {
                return {
                    size: {
                        height: '25vh',
                    },
                    data: this.graphData,
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%Y-%m-%d',
                                culling: true,
                                multiline: false,
                                fit: true,
                            },
                        },
                        y: {
                            tick: {
                                format: formatMoney,
                            },
                        },
                    },
                    line: {
                        step: {
                            type: 'step-after',
                        },
                    },
                    legend: {
                        show: false,
                    },
                    grid: {
                        y: {
                            show: true,
                        },
                        x: {
                            lines: [
                                {value: this.today, text: 'Today'},
                            ],
                        },
                    },
                };
            },
            async update() {
                const response = await client.dailyBalances(this.afterDate, this.untilDate);
                this.dailyBalances = response.dailyBalances;
                this.scheduledBalances = response.scheduledBalances;
                this.$chart.load(this.graphData);
            },
            reload() {
                this.$chart.unload();
                this.$nextTick(() => {
                    this.update();
                });
            },
        },
        async mounted() {
            const response = await client.dailyBalances(this.afterDate, this.untilDate);
            this.dailyBalances = response.dailyBalances;
            this.scheduledBalances = response.scheduledBalances;
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

    .chart {
        .c3-line {
            stroke-width: 2px;
        }

        .c3-ygrid {
            stroke-dasharray: none;
            stroke: #ddd;
        }
    }
</style>
