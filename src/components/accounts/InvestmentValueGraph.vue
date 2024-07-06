<template>
    <graph-panel ref="chartPanel" title="" class="elevation-0"> </graph-panel>
</template>

<script>
import c3 from 'c3';
import { mapState } from 'pinia';
import GraphPanel from '../util/GraphPanel.vue';
import formatMoney from '../util/formatMoney';
import { formatDate } from '../../api/apiFormats';
import { addMonths, addDays, isBefore, parseISO, isAfter } from 'date-fns';
import debounce from 'debounce';
import { useValuesStore } from '../../stores/valuesStore';

const maxTicks = width => Math.floor(width / 160);

const doUpdate = debounce(function () {
    this.update();
}, 500);

export default {
    props: {
        account: {
            type: Object,
            required: true,
        },
        balances: {
            types: Array,
            required: true,
        },
        previousMonths: {
            types: [Number, String],
            default: 'All',
        },
    },
    computed: {
        graphData() {
            return {
                type: 'line',
                types: {
                    profit: 'area',
                },
                json: this.dataPoints,
                keys: {
                    x: 'date',
                    value: ['value', 'balance', 'profit'],
                },
                names: {
                    value: 'Investment Value',
                    balance: 'Invested Amount',
                    profit: 'Profit/Loss',
                },
                colors: {
                    value: '#2196F3',
                    balance: 'gray',
                    profit: 'orange',
                },
                unload: true,
            };
        },
        dataPoints() {
            let data = {};
            const update = (date, applyFn) => {
                const item = data[date] || { date };
                applyFn(item);
                data[date] = item;
            };
            let startBalance = null;
            let startValue = null;
            const startDate =
                this.previousMonths == 'All'
                    ? null
                    : addMonths(new Date(), -this.previousMonths);
            this.values.forEach(value => {
                if (startDate != null && isBefore(value.date, startDate)) {
                    if (
                        startValue == null ||
                        isAfter(value.date, startValue.date)
                    ) {
                        startValue = value;
                    }
                    return;
                }
                update(value.date, item => (item.value = value.value));
            });
            this.balances.forEach(balance => {
                if (startDate != null && isBefore(balance.date, startDate)) {
                    if (
                        startBalance == null ||
                        isAfter(balance.date, startBalance.date)
                    ) {
                        startBalance = balance;
                    }
                    return;
                }
                update(balance.date, item => (item.balance = balance.balance));
            });

            if (startValue !== null) {
                update(
                    formatDate(startDate),
                    item =>
                        (item.value =
                            item.value !== undefined
                                ? item.value
                                : startValue.value)
                );
            }
            if (startBalance !== null) {
                update(
                    formatDate(startDate),
                    item =>
                        (item.balance =
                            item.balance !== undefined
                                ? item.balance
                                : startBalance.balance)
                );
            }
            data = Object.values(data);
            data.sort((a, b) => {
                return a.date < b.date ? -1 : 1;
            });
            let value;
            let balance;

            data.forEach(item => {
                if (item.value !== undefined) {
                    value = item.value;
                } else {
                    item.value = value;
                }
                if (item.balance !== undefined) {
                    balance = item.balance;
                } else {
                    item.balance = balance;
                }
                if (item.value !== undefined && item.balance !== undefined) {
                    item.profit = item.value - item.balance;
                }
            });
            return data;
        },
        tickValues() {
            if (this.values.length == 0) {
                return [];
            }
            let date = parseISO(this.values[this.values.length - 1].date);
            const endDate = parseISO(this.values[0].date);
            let increment = addMonths;
            if (!isBefore(addMonths(date, 1), endDate)) {
                increment = addDays;
            }
            let ticks = [formatDate(date)];
            while (isBefore(date, endDate)) {
                date = increment(date, 1);
                ticks.push(formatDate(date));
            }
            while (ticks.length > this.maxTicks) {
                ticks = ticks.filter((value, idx) => idx % 2 === 0);
            }
            return ticks;
        },
        ...mapState(useValuesStore, ['values', 'loading']),
    },

    watch: {
        values: doUpdate,
        balances: doUpdate,
        previousMonths: doUpdate,
    },

    async mounted() {
        this.maxTicks = maxTicks(this.$refs.chartPanel.chart.offsetWidth);
        const args = this.getArgs();
        this.$chart = c3.generate({
            bindto: this.$refs.chartPanel.chart,
            ...args,
        });
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
                },
                grid: {
                    y: {
                        show: true,
                        lines: [{ value: 0, class: 'grid0' }],
                    },
                    x: {},
                },
                padding: {
                    left: 100,
                    right: 100,
                    bottom: 10,
                },
            };
        },

        update() {
            this.$chart.internal.config.axis_x_tick_values = this.tickValues;
            this.$chart.load(this.graphData);
        },
    },
    components: {
        GraphPanel,
    },
};
</script>

<style lang="scss">
.grid0 line {
    stroke: black;
    stroke-width: 1px;
}
</style>
