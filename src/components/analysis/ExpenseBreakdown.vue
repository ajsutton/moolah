<template>
    <graph-panel
        ref="chartPanel"
        title="Expenses by Category"
        class="expense-breakdown-graph"
        @resize="handleResize"
    >
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-select
                v-model="previousMonths"
                class="mt-4"
                label="History"
                :items="historyItems"
            ></v-select>
        </v-toolbar-items>
        <v-breadcrumbs
            v-if="breadcrumbs.length > 1"
            slot="footer"
            icons
            :items="breadcrumbs"
        >
            <template #divider>
                <v-icon>mdi-chevron-right</v-icon>
            </template>
            <template #item="props">
                <v-breadcrumbs-item
                    :key="props.item.id"
                    @click.native="rootCategoryId = props.item.id"
                >
                    {{ props.item.name }}
                </v-breadcrumbs-item>
            </template>
        </v-breadcrumbs>

        <pie-chart
            slot="chart"
            :data="categories"
            @click="onGraphClick"
        ></pie-chart>
    </graph-panel>
</template>

<script>
import client from '../../api/client';
import addMonths from 'date-fns/addMonths';
import { formatDate } from '../../api/apiFormats';
import debounce from 'debounce';
import { mapState } from 'pinia';
import { useCategoryStore } from '../../stores/categoryStore';
import { summariseCategories } from './expenseBreakdownData';
import GraphPanel from '../util/GraphPanel.vue';
import PieChart from '../charts/PieChart.vue';

export default {
    data() {
        return {
            expenseBreakdown: [],
            rootCategoryId: null,
            previousMonths: 6,
            historyItems: [
                { text: '1 Month', value: 1 },
                { text: '3 Months', value: 3 },
                { text: '6 Months', value: 6 },
                { text: '9 Months', value: 9 },
                { text: '1 Year', value: 12 },
                { text: '2 Years', value: 24 },
                { text: '3 Years', value: 36 },
                { text: '4 Years', value: 48 },
                { text: '5 Years', value: 60 },
                { text: 'All', value: 'All' },
            ],
        };
    },
    computed: {
        afterDate() {
            return this.previousMonths !== 'All'
                ? formatDate(addMonths(new Date(), -this.previousMonths))
                : undefined;
        },

        categories() {
            return summariseCategories(
                this.expenseBreakdown,
                this.rootCategoryId,
                this.categoriesById
            );
        },

        breadcrumbs() {
            const crumbs = [];
            let id = this.rootCategoryId;
            while (id != null) {
                const category = this.categoriesById[id];
                crumbs.unshift(category);
                id = category.parentId;
            }
            crumbs.unshift({ name: 'Categories', id: null });
            return crumbs;
        },
        ...mapState(useCategoryStore, ['getCategoryName', 'categoriesById']),
    },
    watch: {
        previousMonths() {
            this.update();
        },
        graphData() {
            if (this.$chart) {
                this.$chart.load(this.graphData);
            }
        },
    },
    methods: {
        onGraphClick(data) {
            const categoryId = this.categories[data.index][2];
            const category = this.categoriesById[categoryId];
            if (category.children.length > 0) {
                this.rootCategoryId = categoryId;
            }
        },
        async update() {
            this.expenseBreakdown = await client.expenseBreakdown(
                new Date().getDate(),
                this.afterDate
            );
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
    },
    beforeDestroy() {
        if (this.$chart) {
            this.$chart = this.$chart.destroy();
        }
    },
    components: {
        GraphPanel,
        PieChart,
    },
};
</script>

<style lang="scss">
.expense-breakdown-graph {
    .input-group--select {
        min-width: 10em;
    }
}
</style>
