<template>
    <graph-panel title="" class="elevation-0" ref="chartPanel"> </graph-panel>
</template>

<script>
import c3 from 'c3';
import { mapState, mapGetters } from 'vuex';
import GraphPanel from '../util/GraphPanel.vue';
import formatMoney from '../util/formatMoney';
import { formatDate } from '../../api/apiFormats';
import addMonths from 'date-fns/addMonths';
import addDays from 'date-fns/addDays';
import isBefore from 'date-fns/isBefore';
import parseISO from 'date-fns/parseISO';
import debounce from 'debounce';
import client from '../../api/client';

const maxTicks = (width) => Math.floor(width / 160);

export default {
    props: {
        account: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            balances: [],
        };
    },
    computed: {
        graphData() {
            return {
                type: 'step',
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
            var data = {};
            this.values.forEach((value) => {
                const item = data[value.date] || {
                    date: value.date,
                };
                item.value = value.value;
                data[value.date] = item;
            });
            this.balances.forEach((balance) => {
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
            var value = undefined;
            var balance = undefined;
            data.forEach((item) => {
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
            let endDate = parseISO(this.values[0].date);
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
        ...mapState('values', ['values']),
        ...mapState('transactions', ['transactions']),
        ...mapGetters('values', ['loading']),
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

        async updateBalances() {
            this.balances = await client.accounts.dailyBalances(
                this.account.id
            );
            this.update();
        },
    },

    watch: {
        values: {
            handler: debounce(function () {
                this.update();
            }, 500),
        },
        transactions: {
            handler: debounce(async function () {
                this.updateBalances();
            }, 500),
            deep: true,
        },
    },

    async mounted() {
        this.updateBalances();
        this.maxTicks = maxTicks(this.$refs.chartPanel.chart.offsetWidth);
        const args = this.getArgs();
        this.$chart = c3.generate({
            bindto: this.$refs.chartPanel.chart,
            ...args,
        });
    },
    components: {
        GraphPanel,
    },
};
</script>
