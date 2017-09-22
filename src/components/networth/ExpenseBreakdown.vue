<template>
    <v-card class="expense-breakdown-graph" v-resize="handleResize">
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Expenses by Category</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
            </v-toolbar-items>
        </v-toolbar>
        <div ref="chart" class="chart"></div>
        <v-breadcrumbs icons divider="chevron_right" v-if="breadcrumbs.length > 1">
            <v-breadcrumbs-item v-for="item in breadcrumbs" :key="item.id" @click.native="rootCategoryId = item.id">
                {{ item.name }}
            </v-breadcrumbs-item>
        </v-breadcrumbs>
    </v-card>
</template>

<script>
    import c3 from 'c3';
    import client from '../../api/client';
    import formatMoney from '../util/formatMoney';
    import addMonths from 'date-fns/add_months';
    import {formatDate} from '../../api/apiFormats';
    import debounce from 'debounce';
    import {mapGetters, mapState} from 'vuex';
    import summariseCategories from './expenseBreakdownData';

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
                return summariseCategories(this.expenseBreakdown, this.rootCategoryId, this.getCategoryName, this.categoriesById);
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
                        this.rootCategoryId = this.categories[data.index][2];
                    }
                };
            },

            ...mapGetters('categories', ['getCategoryName']),
            ...mapState('categories', ['categoriesById'])
        },
        watch: {
            previousMonths() {
                this.update();
            },
            rootCategoryId() {
                this.update();
            },
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
                        format:{ 
                            value(value, ratio) {
                                return `${formatMoney(-value)} (${Math.round(ratio * 100)}%)`;
                            },
                        },
                    },
                };
            },
            async update() {
                this.expenseBreakdown = await client.expenseBreakdown(this.afterDate);
                this.$chart.load(this.graphData);
            },
            reload() {
                this.$chart.unload();
                this.$nextTick(() => {
                    this.update();
                });
            },

            handleResize: debounce(function() {
                this.update();
            }, 100),
        },
        async mounted() {
            this.expenseBreakdown = await client.expenseBreakdown(this.afterDate);
            const args = this.getArgs();
            this.$chart = c3.generate({
                bindto: this.$refs.chart,
                ...args
            });
        },
        beforeDestroy() {
            this.$chart = this.$chart.destroy();
        },
    };
</script>

<style lang="scss">
    @import "~c3/c3.css";

    .expense-breakdown-graph {
        .input-group--select {
            min-width: 10em;
        }
    }
</style>