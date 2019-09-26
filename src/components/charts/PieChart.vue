<template>
    <div class="chart" ref="chart"></div>
</template>

<script>
import c3 from "c3";
import formatMoney from "../util/formatMoney";

export default {
    props: {
        data: {
            type: Array,
            required: true
        }
    },
    computed: {
        chart() {
            return this.$refs.chart;
        },
        graphData() {
            return {
                type: "pie",
                columns: this.data,
                unload: true,
                onclick: data => {
                    this.$emit("click", data);
                }
            };
        },
        graphOptions() {
            return {
                data: this.graphData,
                padding: {
                    left: 0,
                    right: 40,
                    bottom: 10
                },
                pie: {
                    label: {
                        format(value, ratio, title) {
                            return title;
                        }
                    },
                    expand: false
                },
                legend: {
                    show: false
                },
                tooltip: {
                    format: {
                        value(value, ratio) {
                            return `${formatMoney(-value)} (${Math.round(
                                ratio * 100
                            )}%)`;
                        }
                    }
                }
            };
        }
    },
    watch: {
        graphData() {
            if (this.$chart) {
                this.$chart.load(this.graphData);
            }
        }
    },
    mounted() {
        this.$chart = c3.generate({
            bindto: this.chart,
            ...this.graphOptions
        });
    },
    beforeDestroy() {
        this.$chart = this.$chart.destroy();
    }
};
</script>
