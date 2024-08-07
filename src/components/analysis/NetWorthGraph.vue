<template>
    <graph-panel
        ref="chartPanel"
        title="Net Worth"
        class="networth-graph"
        @resize="handleResize"
    >
        <v-toolbar-items>
            <v-select
                min-width="120"
                variant="underlined"
                class="mt-4 me-2"
                density="comfortable"
                v-model="previousMonths"
                label="History"
                :items="historyItems"
            ></v-select>
            <v-select
                min-width="120"
                variant="underlined"
                class="mt-4 me-2"
                density="comfortable"
                v-model="forecastMonths"
                label="Forecast"
                :items="forecastItems"
            ></v-select>
        </v-toolbar-items>
    </graph-panel>
</template>

<script>
import c3 from 'c3';
import client from '../../api/client';
import formatMoney from '../util/formatMoney';
import { addMonths } from 'date-fns';
import { formatDate } from '../../api/apiFormats';
import debounce from 'debounce';
import extrapolateBalances from './netWorthGraphData';
import GraphPanel from '../util/GraphPanel.vue';
import { mapState } from 'pinia';
import { useScheduledTransactionsStore } from '../../stores/transactions/transactionStore';

const maxTicks = width => Math.floor(width / 160);

const items = (nullLabel, nullValue) => [
    { title: '1 Month', value: 1 },
    { title: '3 Months', value: 3 },
    { title: '6 Months', value: 6 },
    { title: '9 Months', value: 9 },
    { title: '1 Year', value: 12 },
    { title: '2 Years', value: 24 },
    { title: '3 Years', value: 36 },
    { title: '4 Years', value: 48 },
    { title: '5 Years', value: 60 },
    { title: nullLabel, value: nullValue },
];

export default {
    data() {
        return {
            dailyBalances: [],
            scheduledBalances: [],
            historyItems: items('All', 'All'),
            forecastItems: items('None', 0),
            today: formatDate(new Date()),
            previousMonths: 12,
            forecastMonths: 1,
            maxTicks: 1000,
        };
    },
    computed: {
        extrapolatedBalances() {
            return extrapolateBalances(
                this.dailyBalances,
                this.scheduledBalances,
                this.today,
                this.untilDate
            );
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
                    value: [
                        'balance',
                        'availableFunds',
                        'investments',
                        'netWorth',
                        'bestFit',
                        'scheduled',
                        'scheduledAvailableFunds',
                        'investmentValue',
                    ],
                },
                names: {
                    balance: 'Current Funds',
                    scheduled: 'Scheduled Current Funds',
                    investments: 'Invested Amount',
                    netWorth: 'Net Worth',
                    scheduledAvailableFunds: 'Scheduled Available Funds',
                    bestFit: 'Best Fit',
                    availableFunds: 'Available Funds',
                    investmentValue: 'Investment Value',
                },
                colors: {
                    availableFunds: '#4CAF50',
                    scheduledAvailableFunds: '#A5D6A7',
                    bestFit: 'gray',
                    balance: '#2196F3',
                    investments: 'lightgray',
                    investmentValue: 'gray',
                    netWorth: 'rgb(31, 119, 180)',
                    scheduled: '#90CAF9',
                },
                unload: true,
            };
        },
        afterDate() {
            return this.previousMonths !== 'All'
                ? formatDate(addMonths(new Date(), -this.previousMonths))
                : undefined;
        },
        untilDate() {
            return this.forecastMonths !== 'None'
                ? formatDate(addMonths(new Date(), this.forecastMonths))
                : undefined;
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
        ...mapState(useScheduledTransactionsStore, {
            scheduledTransactions: 'transactions',
        }),
    },
    watch: {
        previousMonths() {
            this.update();
        },
        forecastMonths() {
            this.update();
        },
        scheduledTransactions: {
            handler: debounce(function () {
                this.update();
            }, 500),
            deep: true,
        },
    },
    async mounted() {
        const response = await client.dailyBalances(
            this.afterDate,
            this.untilDate
        );
        this.dailyBalances = response.dailyBalances;
        this.scheduledBalances = response.scheduledBalances || [];
        this.maxTicks = maxTicks(this.$refs.chartPanel.chart.offsetWidth);
        const args = this.getArgs();
        this.$chart = c3.generate({
            bindto: this.$refs.chartPanel.chart,
            ...args,
        });
    },
    beforeUnmount() {
        if (this.$chart) {
            this.$chart = this.$chart.destroy();
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
                    },
                },
                grid: {
                    y: {
                        show: true,
                        lines: [{ value: 0, class: 'zero-line' }],
                    },
                    x: {
                        lines: [{ value: this.today, text: 'Today' }],
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
            const response = await client.dailyBalances(
                this.afterDate,
                this.untilDate
            );
            this.dailyBalances = response.dailyBalances;
            this.scheduledBalances = response.scheduledBalances || [];
            this.$chart.internal.config.axis_x_tick_values = this.tickValues;
            this.$chart.load(this.graphData);
        },
        reload() {
            if (this.$chart) {
                this.$chart.unload();
                this.$nextTick(() => {
                    this.$chart.internal.config.axis_x_tick_values =
                        this.tickValues;
                    this.$chart.load(this.graphData);
                });
            }
        },

        handleResize() {
            if (this.$refs.chartPanel.chart) {
                this.maxTicks = maxTicks(
                    this.$refs.chartPanel.chart.offsetWidth
                );
            }
            this.reload();
        },
    },
    components: {
        GraphPanel,
    },
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

    .zero-line {
        color: black;
        stroke-width: 2px;
    }
}
</style>
