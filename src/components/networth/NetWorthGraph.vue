<template>
    <div ref="chart">abcc</div>
</template>

<script>
    import c3 from 'c3';
    import client from '../../api/client';
    import formatMoney from '../util/formatMoney';

    export default {
        methods: {
            getArgs (balances) {
                return {
                    size: {
                        height: '25vh',
                    },
                    data: {
                        type: 'step',
                        json: balances.dailyBalances,
                        keys: {
                            x: 'date',
                            value: ['balance'],
                        },
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%Y-%m-%d',
                                culling: true,
                                fit: true,
                            }
                        },
                        y: {
                            tick: {
                                format: formatMoney
                            }
                        },
                    },
                    legend: {
                        show: false,
                    }
                };
            },
            update: function update () {
                const data = this.getData()
                this.$chart.load(data)
                this.$emit('update', data)
            },
            transform: function transform (...args) {
                this.$chart.transform(...args)
            },
            reload: function reload () {
                this.$emit('reloading')
                this.$chart.unload()
                this.$nextTick(() => {
                    this.update()
                })
            }
        },
        async mounted () {
            const balances = await client.dailyBalances('2017-01-01');
            const args = this.getArgs(balances)
            this.$chart = c3.generate({
                bindto: this.$refs.chart,
                ...args
            })
            this.$emit('init', args);
        },
        beforeDestroy () {
            this.$chart = this.$chart.destroy()
        }
    };
</script>

<style lang="scss">
    @import "~c3/c3.css";
</style>