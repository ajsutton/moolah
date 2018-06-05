<template>
    <v-container>
        <v-layout wrap>
            <v-flex md6>
                <table class="table spending-breakdown mx-auto">
                    <thead>
                        <th class="text-xs-left">
                            <add-line-item :earmark="earmark" :excludeCategories="existingCategoryIds" @add="addCategory"></add-line-item>
                        </th>
                        <th class="text-xs-right">Actual</th>
                        <th class="text-xs-right">Budget</th>
                        <th class="text-xs-right">Remaining</th>
                    </thead>
                    <tbody>
                    <tr v-for="category in flattenedCategories" :key="category.id" :class="{total: category.total}">
                        <td>
                            <div :style="{'margin-left': category.level * 24 + 'px'}">{{category.name}}</div>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount :value="category.subtotal" v-if="category.total"></monetary-amount>
                            <monetary-amount :value="category.balance" v-if="!category.total && (category.budget !== 0 || category.balance !== 0)"></monetary-amount>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount :value="category.budgetSubtotal" v-if="category.total"></monetary-amount>
                            <v-edit-dialog large lazy persistent 
                                    v-if="!category.total && (category.budget !== 0 || category.balance !== 0)" 
                                    return-value.sync="getBudgetEditValue(category.id)" 
                                    @update:returnValue="val => save(category.id, val)">
                                <span>
                                    <monetary-amount :value="category.budget"></monetary-amount>
                                    <v-icon small class="edit-icon">edit</v-icon>
                                </span>
                                <v-text-field slot="input" class="input" name="amount" label="Budget" :value="getBudgetEditValue(category.id)" @input="val => updateBudget(category.id, val)" prefix="$" :rules="rules.amount"></v-text-field>
                            </v-edit-dialog>
                        </td>
                        <td class="text-xs-right">
                            <monetary-amount :value="category.budgetSubtotal + category.subtotal" v-if="category.total"></monetary-amount>
                            <monetary-amount :value="category.budget + category.balance" v-if="!category.total && (category.budget !== 0 || category.balance !== 0)"></monetary-amount>
                        </td>
                    </tr>
                    <tr v-if="unallocatedBudget !== 0">
                        <td class="text-xs-left">Unallocated</td>
                        <td class="text-xs-right">-</td>
                        <td class="text-xs-right"><monetary-amount :value="unallocatedBudget"></monetary-amount></td>
                        <td class="text-xs-right"><monetary-amount :value="unallocatedBudget"></monetary-amount></td>
                    </tr>
                    </tbody>
                    <tfoot>
                    <tr>
                        <th class="text-xs-left">Total</th>
                        <th class="text-xs-right">
                            <monetary-amount :value="earmark.spent"></monetary-amount>
                        </th>
                        <th class="text-xs-right">
                            <monetary-amount :value="totalBudget + unallocatedBudget"></monetary-amount>
                        </th>
                        <th class="text-xs-right">
                            <monetary-amount :value="totalBudget + unallocatedBudget + earmark.spent"></monetary-amount>
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
    import {rules} from '../validation.js';
    import AddLineItem from './AddLineItem.vue';
    import Vue from 'vue';
    

    export default {
        props: {
            earmark: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                categoryData: {},
                rules,
            };
        },
        computed: {
            categories() {
                return buildCategoryBalanceTree(this.categoryData, this.rawCategories);
            },
            flattenedCategories() {
                const result = [];
                const addCategory = (category, level, namePrefix, skipTotal = false) => {
                    const parentRequired = category.balance !== 0 || category.budget !== 0 || category.children.length > 1;
                    category.level = level;
                    category.name = namePrefix + category.name;
                    if (parentRequired) {
                        result.push(category);
                    }
                    category.children.forEach(child => addCategory(child, parentRequired ? level + 1 : level, parentRequired ? '' : category.name + ' - '));
                    if (category.children.length > 1 && !skipTotal) {
                        result.push({name: 'Total ' + category.name, subtotal: category.subtotal, balance: 0, budget: 0, budgetSubtotal: category.budgetSubtotal, level: level, total: true});
                    }
                };
                this.categories.forEach(category => addCategory(category, 0, '', this.categories.length === 1));
                return result;
            },
            existingCategoryIds() {
                return Object.keys(this.categoryData).map(categoryId => this.categoriesById[categoryId]);
            },

            totalBudget() {
                return this.categories.reduce((total, category) => total + category.budgetSubtotal, 0);
            },

            unallocatedBudget() {
                return this.earmark.savingsTarget ? this.earmark.savingsTarget - this.totalBudget : 0;
            },

            pieChartData() {
                return Object.entries(this.categoryData)
                    .map(([categoryId, entry]) => [this.categoriesById[categoryId].name, entry.balance]);
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
                const [categoryBalanceById, categoryBudgetById] = await Promise.all([client.categoryBalances({earmark: this.earmark.id, transactionType: 'expense'}), client.earmarkBudget(this.earmark.id)]);
                const categoryData = {};
                Object.entries(categoryBalanceById).forEach(([categoryId, balance]) => categoryData[categoryId] = {balance: balance, budget: 0});
                Object.entries(categoryBudgetById).forEach(([categoryId, budget]) => {
                    const entry = categoryData[categoryId];
                    if (entry) {
                        entry.budget = budget;
                    } else {
                        categoryData[categoryId] = {balance: 0, budget};
                    }
                });
                this.categoryData = categoryData;
            },
            updateBudget(categoryId, value) {
                this.categoryData[categoryId].editValue = Math.round(parseFloat(value) * 100);
            },
            getBudgetEditValue(categoryId) {
                const category = this.categoryData[categoryId];
                if (category.editValue !== undefined) {
                    return category.editValue;
                } else {
                    return (category.budget / 100).toFixed(2);
                }
            },
            addCategory(categoryId, budget) {
                Vue.set(this.categoryData, categoryId, {balance: 0, budget});
            },
            async save(categoryId, newBudget) {
                const category = this.categoryData[categoryId];
                const originalBudget = category.budget;
                category.budget = Math.round(parseFloat(newBudget) * 100);
                category.editValue = undefined;
                try {
                    await client.setEarmarkBudget(this.earmark.id, categoryId, category.budget);
                } catch (error) {
                    console.error(error);
                    category.budget = originalBudget;
                }
            }
        },
        components: {
            MonetaryAmount,
            PieChart,
            AddLineItem,
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

        .edit-icon {
            display: none;
            position: absolute;
            margin-left: 2px;
        }

        td:hover .edit-icon {
            display: inline;
        }
    }
</style>
