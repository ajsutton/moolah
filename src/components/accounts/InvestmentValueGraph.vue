<template>
    <graph-panel ref="chartPanel" title="" class="elevation-0"> </graph-panel>
</template>

<script>
import c3 from 'c3';
import { mapState } from 'pinia';
import GraphPanel from '../util/GraphPanel.vue';
import formatMoney from '../util/formatMoney';
import { formatDate } from '../../api/apiFormats';
import addMonths from 'date-fns/addMonths';
import addDays from 'date-fns/addDays';
import isBefore from 'date-fns/isBefore';
import parseISO from 'date-fns/parseISO';
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
    },
    computed: {
        graphData() {
            return {
                type: 'line',
                json: this.dataPoints,
                keys: {
                    x: 'date',
                    value: ['value', 'balance'],
                },
                names: {
                    value: 'Investment Value',
                    balance: 'Invested Amount',
                },
                colors: {
                    value: '#2196F3',
                    balance: 'gray',
                },
                unload: true,
            };
        },
        dataPoints() {
            let data = {};
            this.values.forEach(value => {
                const item = data[value.date] || {
                    date: value.date,
                };
                item.value = value.value;
                data[value.date] = item;
            });
            this.balances.forEach(balance => {
                const item = data[balance.date] || {
                    date: balance.date,
                };
                item.balance = balance.balance;
                data[balance.date] = item;
            });
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
                    },
                    x: {},
                },
                padding: {
                    left: 100,
                    right: 40,
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
