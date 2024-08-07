<template>
    <graph-panel
        ref="chartPanel"
        title="Expenses by Category Over Time"
        class="expense-category-time-graph"
        @resize="handleResize"
    >
        <v-spacer></v-spacer>

        <v-toolbar-items>
            <v-select
                min-width="120"
                v-model="actualValues"
                variant="underlined"
                class="mt-4 me-2"
                density="comfortable"
                label="Values"
                :items="[
                    { title: 'Percentage', value: false },
                    { title: 'Actual', value: true },
                ]"
            ></v-select>

            <v-select
                min-width="120"
                v-model="previousMonths"
                variant="underlined"
                class="mt-4 me-2"
                density="comfortable"
                label="History"
                :items="historyItems"
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
import { mapState } from 'pinia';
import { useCategoryStore } from '../../stores/categoryStore';
import { categoriesOverTimeGraphData } from './categories/categoryOverTimeData';
import GraphPanel from '../util/GraphPanel.vue';

export default {
    data() {
        return {
            expenseBreakdown: [],
            rootCategoryId: null,
            previousMonths: 24,
            actualValues: false,
            historyItems: [
                { title: '1 Month', value: 1 },
                { title: '3 Months', value: 3 },
                { title: '6 Months', value: 6 },
                { title: '9 Months', value: 9 },
                { title: '1 Year', value: 12 },
                { title: '2 Years', value: 24 },
                { title: '3 Years', value: 36 },
                { title: '4 Years', value: 48 },
                { title: '5 Years', value: 60 },
                { title: 'All', value: 'All' },
            ],
        };
    },
    computed: {
        afterDate() {
            return this.previousMonths !== 'All'
                ? formatDate(addMonths(new Date(), -this.previousMonths))
                : undefined;
        },

        graphData() {
            return categoriesOverTimeGraphData(
                this.expenseBreakdown,
                this.actualValues,
                this.getCategoryName,
                this.categoriesById
            );
        },

        ...mapState(useCategoryStore, ['getCategoryName', 'categoriesById']),
    },
    watch: {
        actualValues() {
            this.$chart.destroy();
            const args = this.getArgs();
            this.$chart = c3.generate({
                bindto: this.$refs.chartPanel.chart,
                ...args,
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
                        },
                    },
                    y: {
                        show: true,
                        min: actualValues ? undefined : 0,
                        max: actualValues ? undefined : 100,
                        padding: 0,
                        tick: {
                            format: value =>
                                actualValues ? formatMoney(value) : value + '%',
                        },
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
                    format: {
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
            this.expenseBreakdown = await client.expenseBreakdown(
                new Date().getDate(),
                this.afterDate
            );
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

        handleResize: debounce(function () {
            this.reload();
        }, 100),
    },
    async mounted() {
        this.expenseBreakdown = await client.expenseBreakdown(
            new Date().getDate(),
            this.afterDate
        );
        const args = this.getArgs();
        this.$chart = c3.generate({
            bindto: this.$refs.chartPanel.chart,
            ...args,
        });
    },
    beforeUnmount() {
        this.$chart = this.$chart.destroy();
    },
    components: {
        GraphPanel,
    },
};
</script>

<style lang="scss">
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
