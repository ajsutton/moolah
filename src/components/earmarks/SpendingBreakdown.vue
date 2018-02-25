<template>
    <v-container>
        <v-layout>
            <v-flex md6>
                <table class="table spending-breakdown mx-auto">
                    <tbody>
                    <tr v-for="category in flattenedCategories" :key="category.id" :class="{total: category.total}">
                        <td>
                            <div :style="{'margin-left': category.level * 24 + 'px'}">{{category.name}}</div>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount :value="category.subtotal" v-if="category.total"></monetary-amount>
                            <monetary-amount :value="category.balance" v-if="!category.total && category.balance !== 0"></monetary-amount>
                        </td>
                    </tr>
                    </tbody>
                    <tfoot>
                    <tr>
                        <th class="text-xs-left">Total</th>
                        <th class="text-xs-right">
                            <monetary-amount :value="earmark.spent"></monetary-amount>
                        </th>
                    </tr>
                    </tfoot>
                </table>
            </v-flex>
            <v-flex md6>
                <pie-chart :data="pieChartData"></pie-chart>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import client from '../../api/client';
    import {buildCategoryBalanceTree} from './categoryBalances';
    import PieChart from '../charts/PieChart.vue';
    import debounce from 'debounce';

    export default {
        props: {
            earmark: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                categoryBalanceById: {},
            };
        },
        computed: {
            categories() {
                return buildCategoryBalanceTree(this.categoryBalanceById, this.rawCategories);
            },
            flattenedCategories() {
                const result = [];
                const addCategory = (category, level, namePrefix, skipTotal = false) => {
                    const parentRequired = category.balance !== 0 || category.children.length > 1;
                    category.level = level;
                    category.name = namePrefix + category.name;
                    if (parentRequired) {
                        result.push(category);
                    }
                    category.children.forEach(child => addCategory(child, parentRequired ? level + 1 : level, parentRequired ? '' : category.name + ' - '));
                    if (category.children.length > 1 && !skipTotal) {
                        result.push({name: 'Total ' + category.name, subtotal: category.subtotal, balance: 0, level: level, total: true});
                    }
                };
                this.categories.forEach(category => addCategory(category, 0, '', this.categories.length === 1));
                return result;
            },

            pieChartData() {
                return Object.entries(this.categoryBalanceById)
                    .map(([categoryId, balance]) => [this.categoriesById[categoryId].name, balance]);
            },

            ...mapState('categories', {rawCategories: 'categories', categoriesById: 'categoriesById'}),
            ...mapGetters('categories', ['getCategoryName']),
            ...mapState('transactions', ['transactions']),
        },
        created() {
            this.load();
        },
        watch: {
            transactions: {
                handler: debounce(function() {
                    this.load();
                }, 250),
                deep: true,
            },
        },
        methods: {
            async load() {
                this.categoryBalanceById = await client.categoryBalances({earmark: this.earmark.id, transactionType: 'expense'});
            },
        },
        components: {
            MonetaryAmount,
            PieChart,
        },
    };
</script>

<style lang="scss">
    .spending-breakdown {
        tfoot td, tfoot th {
            padding: 0 24px;
            color: rgba(0, 0, 0, .54);
            font-weight: 500;
            font-size: 12px;
        }

        tfoot {
            border-top: rgba(0, 0, 0, .12) solid 3px;
        }

        .total {
            font-style: italic !important;
        }
    }
</style>
