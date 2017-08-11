<template>
    <v-card class="networth-graph">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Net Worth</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
                <v-select label="Forecast" :items="forecastItems" v-model="forecastMonths"></v-select>
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

    const items = nullLabel => [
        {text: '1 Month', value: 1},
        {text: '3 Months', value: 3},
        {text: '6 Months', value: 6},
        {text: '9 Months', value: 9},
        {text: '1 Year', value: 12},
        {text: '2 Years', value: 24},
        {text: '3 Years', value: 36},
        {text: '4 Years', value: 48},
        {text: '5 Years', value: 60},
        {text: nullLabel, value: nullLabel},
    ];

    export default {
        data() {
            return {
                dailyBalances: [],
                scheduledBalances: [],
                historyItems: items('All'),
                forecastItems: items('None'),
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
                return this.previousMonths !== 'All' ? formatDate(addMonths(new Date(), -this.previousMonths)) : undefined;
            },
            untilDate() {
                return this.forecastMonths !== 'None' ? formatDate(addMonths(new Date(), this.forecastMonths)) : undefined;
            },
            tickValues() {
                let date = new Date();
                const ticks = [formatDate(date)];
                for (let i = 0; i < this.previousMonths; i++) {
                    date = addMonths(date, -1);
                    ticks.push(formatDate(date));
                }
                date = new Date();
                for (let i = 0; i < this.forecastMonths; i++) {
                    date = addMonths(date, 1);
                    ticks.push(formatDate(date));
                }
                return ticks;
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
                                values: this.tickValues,
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
                    padding: {
                        left: 100,
                        right: 40,
                        bottom: 10,
                    },
                };
            },
            async update() {
                const response = await client.dailyBalances(this.afterDate, this.untilDate);
                this.dailyBalances = response.dailyBalances;
                this.scheduledBalances = response.scheduledBalances || [];
                this.$chart.internal.config.axis_x_tick_values = this.tickValues;
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
            this.scheduledBalances = response.scheduledBalances || [];
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

    .networth-graph {
        .input-group--select {
            min-width: 10em;
            margin-left: 12px;
        }
    }

    .chart {
        svg {
            font-family: inherit;
            font-size: inherit;
        }

        .c3-line {
            stroke-width: 2px;
        }

        .c3-ygrid {
            stroke-dasharray: none;
            stroke: #ddd;
        }

        .c3-axis-x-label {
        }
    }
</style>
