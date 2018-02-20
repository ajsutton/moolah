<template>
    <graph-panel title="Net Worth" class="networth-graph" @resize="handleResize" ref="chartPanel">
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
            <v-select label="Forecast" :items="forecastItems" v-model="forecastMonths"></v-select>
        </v-toolbar-items>
    </graph-panel>
</template>

<script>
    import c3 from 'c3';
    import client from '../../api/client';
    import formatMoney from '../util/formatMoney';
    import addMonths from 'date-fns/add_months';
    import {formatDate} from '../../api/apiFormats';
    import debounce from 'debounce';
    import extrapolateBalances from './netWorthGraphData';
    import GraphPanel from './GraphPanel.vue';
    import {mapState} from 'vuex';

    const maxTicks = width => Math.floor(width / 160);

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
                maxTicks: 1000,
            };
        },
        computed: {
            extrapolatedBalances() {
                return extrapolateBalances(this.dailyBalances, this.scheduledBalances, this.today, this.untilDate);
            },
            graphData() {
                return {
                    type: 'step',
                    types: {
                        bestFit: 'line',
                    },
                    json: this.extrapolatedBalances,
                    keys: {
                        x: 'date',
                        value: ['balance', 'availableFunds', 'bestFit', 'scheduled', 'scheduledAvailableFunds'],
                    },
                    names: {
                        balance: 'Net Worth',
                        scheduled: 'Scheduled Net Worth',
                        scheduledAvailableFunds: 'Scheduled Available Funds',
                        bestFit: 'Best Fit',
                        availableFunds: 'Available Funds',
                    },
                    colors: {
                        'availableFunds': '#4CAF50',
                        'scheduledAvailableFunds': '#A5D6A7',
                        'bestFit': 'gray',
                        'balance': '#2196F3',
                        'scheduled': '#90CAF9',
                    },
                    unload: true,
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
                let ticks = [formatDate(date)];
                for (let i = 0; i < this.previousMonths; i++) {
                    date = addMonths(date, -1);
                    ticks.push(formatDate(date));
                }
                date = new Date();
                for (let i = 0; i < this.forecastMonths; i++) {
                    date = addMonths(date, 1);
                    ticks.push(formatDate(date));
                }
                while (ticks.length > this.maxTicks) {
                    ticks = ticks.filter((value, idx) => idx % 2 === 0);
                }
                return ticks;
            },
            ...mapState('scheduledTransactions', {scheduledTransactions: 'transactions'})
        },
        watch: {
            previousMonths() {
                this.update();
            },
            forecastMonths() {
                this.update();
            },
            scheduledTransactions: {
                handler: debounce(function() {
                    this.update();
                }, 500),
                deep: true,
            }
        },
        methods: {
            getArgs() {
                return {
                    size: {
                        height: '25vh',
                    },
                    data: this.graphData,
                    point: {
                        show: false,
                    },
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
                        connectNull: true,
                    },
                    legend: {
                        show: true,
                        position: 'inset',
                        hide: ['bestFit', 'scheduled', 'scheduledAvailableFunds'],
                        inset: {
                            anchor: 'top-left',
                            step: 2,
                        }
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
                if (this.$chart) {
                    this.$chart.unload();
                    this.$nextTick(() => {
                        this.$chart.internal.config.axis_x_tick_values = this.tickValues;
                        this.$chart.load(this.graphData);
                    });
                }
            },

            handleResize() {
                if (this.$refs.chartPanel.chart) {
                    this.maxTicks = maxTicks(this.$refs.chartPanel.chart.offsetWidth);
                }
                this.reload();
            },
        },
        async mounted() {
            const response = await client.dailyBalances(this.afterDate, this.untilDate);
            this.dailyBalances = response.dailyBalances;
            this.scheduledBalances = response.scheduledBalances || [];
            this.maxTicks = maxTicks(this.$refs.chartPanel.chart.offsetWidth);
            const args = this.getArgs();
            this.$chart = c3.generate({
                bindto: this.$refs.chartPanel.chart,
                ...args
            });
        },
        beforeDestroy() {
            if (this.$chart) {
                this.$chart = this.$chart.destroy();
            }
        },
        components: {
            GraphPanel
        }
    };
</script>

<style lang="scss">
    .networth-graph {
        .input-group--select {
            min-width: 10em;
            margin-left: 12px;
        }

        .c3-legend-background {
            fill: transparent;
            stroke: none;
        }
    }
</style>
