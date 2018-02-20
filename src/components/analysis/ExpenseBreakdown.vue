<template>
    <graph-panel title="Expenses by Category" class="expense-breakdown-graph" @resize="handleResize" ref="chartPanel">
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
        </v-toolbar-items>
        <v-breadcrumbs icons v-if="breadcrumbs.length > 1" slot="footer">
            <v-icon slot="divider">chevron_right</v-icon>
            <v-breadcrumbs-item v-for="item in breadcrumbs" :key="item.id" @click.native="rootCategoryId = item.id">
                {{ item.name }}
            </v-breadcrumbs-item>
        </v-breadcrumbs>
    </graph-panel>
</template>

<script>
    import c3 from 'c3';
    import client from '../../api/client';
    import formatMoney from '../util/formatMoney';
    import addMonths from 'date-fns/add_months';
    import {formatDate} from '../../api/apiFormats';
    import debounce from 'debounce';
    import {mapGetters, mapState} from 'vuex';
    import {summariseCategories} from './expenseBreakdownData';
    import GraphPanel from '../util/GraphPanel.vue';

    export default {
        data() {
            return {
                expenseBreakdown: [],
                rootCategoryId: null,
                previousMonths: 6,
                historyItems: [
                    {text: '1 Month', value: 1},
                    {text: '3 Months', value: 3},
                    {text: '6 Months', value: 6},
                    {text: '9 Months', value: 9},
                    {text: '1 Year', value: 12},
                    {text: '2 Years', value: 24},
                    {text: '3 Years', value: 36},
                    {text: '4 Years', value: 48},
                    {text: '5 Years', value: 60},
                    {text: 'All', value: 'All'},
                ],
            };
        },
        computed: {
            afterDate() {
                return this.previousMonths !== 'All' ? formatDate(addMonths(new Date(), -this.previousMonths)) : undefined;
            },

            categories() {
                return summariseCategories(this.expenseBreakdown, this.rootCategoryId, this.categoriesById);
            },

            breadcrumbs() {
                const crumbs = [];
                let id = this.rootCategoryId;
                while (id != null) {
                    const category = this.categoriesById[id];
                    crumbs.unshift(category);
                    id = category.parentId;
                }
                crumbs.unshift({name: 'Categories', id: null});
                return crumbs;
            },

            graphData() {
                return {
                    type: 'pie',
                    columns: this.categories,
                    unload: true,
                    onclick: (data) => {
                        const categoryId = this.categories[data.index][2];
                        const category = this.categoriesById[categoryId];
                        if (category.children.length > 0) {
                            this.rootCategoryId = categoryId;
                        }
                    },
                };
            },

            ...mapGetters('categories', ['getCategoryName']),
            ...mapState('categories', ['categoriesById'])
        },
        watch: {
            previousMonths() {
                this.update();
            },
            graphData() {
                if (this.$chart) {
                    this.$chart.load(this.graphData);
                }
            }
        },
        methods: {
            getArgs() {
                return {
                    data: this.graphData,
                    padding: {
                        left: 100,
                        right: 40,
                        bottom: 10,
                    },
                    pie: {
                        label: {
                            format(value, ratio, title) {
                                return title;
                            },
                        },
                        expand: false,
                    },
                    legend: {
                        show: false,
                    },
                    tooltip: {
                        format: {
                            value(value, ratio) {
                                return `${formatMoney(-value)} (${Math.round(ratio * 100)}%)`;
                            },
                        },
                    },
                };
            },
            async update() {
                this.expenseBreakdown = await client.expenseBreakdown(new Date().getDate(), this.afterDate);
            },
            reload() {
                if (this.$chart) {
                    this.$chart.unload();
                    this.$nextTick(() => {
                        this.$chart.load(this.graphData);
                    });
                }
            },

            handleResize: debounce(function() {
                this.reload();
            }, 100),
        },
        async mounted() {
            this.expenseBreakdown = await client.expenseBreakdown(new Date().getDate(), this.afterDate);
            const args = this.getArgs();
            this.$chart = c3.generate({
                bindto: this.$refs.chartPanel.chart,
                ...args
            });
        },
        beforeDestroy() {
            this.$chart = this.$chart.destroy();
        },
        components: {
            GraphPanel,
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
