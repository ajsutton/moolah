<template>
    <v-container>
        <v-row>
            <v-col md="6">
                <table class="table spending-breakdown mx-auto">
                    <thead>
                        <th class="text-sm-left">
                            <add-line-item
                                :earmark="earmark"
                                :exclude-categories="existingCategoryIds"
                                @add="addCategory"
                            ></add-line-item>
                        </th>
                        <th class="text-sm-right">Actual</th>
                        <th class="text-sm-right">Budget</th>
                        <th class="text-sm-right">Remaining</th>
                    </thead>
                    <tbody>
                        <tr
                            v-for="category in flattenedCategories"
                            :key="category.id"
                            :class="{ total: category.total }"
                        >
                            <td>
                                <div
                                    :style="{
                                        'margin-left':
                                            category.level * 24 + 'px',
                                    }"
                                >
                                    {{ category.name }}
                                </div>
                            </td>
                            <td class="text-sm-right">
                                <monetary-amount
                                    v-if="category.total"
                                    :value="category.subtotal"
                                ></monetary-amount>
                                <monetary-amount
                                    v-if="
                                        !category.total &&
                                        (category.budget !== 0 ||
                                            category.balance !== 0)
                                    "
                                    :value="category.balance"
                                ></monetary-amount>
                            </td>
                            <td class="text-sm-right">
                                <monetary-amount
                                    v-if="category.total"
                                    :value="category.budgetSubtotal"
                                ></monetary-amount>
                                <edit-amount
                                    v-if="
                                        !category.total &&
                                        (category.budget !== 0 ||
                                            category.balance !== 0)
                                    "
                                    :modelValue="category.budget"
                                    @update:modelValue="
                                        val => updateBudget(category.id, val)
                                    "
                                ></edit-amount>
                            </td>
                            <td class="text-sm-right">
                                <monetary-amount
                                    v-if="category.total"
                                    :value="
                                        category.budgetSubtotal +
                                        category.subtotal
                                    "
                                ></monetary-amount>
                                <monetary-amount
                                    v-if="
                                        !category.total &&
                                        (category.budget !== 0 ||
                                            category.balance !== 0)
                                    "
                                    :value="category.budget + category.balance"
                                ></monetary-amount>
                            </td>
                        </tr>
                        <tr v-if="unallocatedBudget !== 0">
                            <td class="text-sm-left">Unallocated</td>
                            <td class="text-sm-right">-</td>
                            <td class="text-sm-right">
                                <monetary-amount
                                    :value="unallocatedBudget"
                                ></monetary-amount>
                            </td>
                            <td class="text-sm-right">
                                <monetary-amount
                                    :value="unallocatedBudget"
                                ></monetary-amount>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="text-sm-left">Total</th>
                            <th class="text-sm-right">
                                <monetary-amount
                                    :value="earmark.spent"
                                ></monetary-amount>
                            </th>
                            <th class="text-sm-right">
                                <monetary-amount
                                    :value="totalBudget + unallocatedBudget"
                                ></monetary-amount>
                            </th>
                            <th class="text-sm-right">
                                <monetary-amount
                                    :value="
                                        totalBudget +
                                        unallocatedBudget +
                                        earmark.spent
                                    "
                                ></monetary-amount>
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </v-col>
            <v-col md="6">
                <pie-chart :data="pieChartData"></pie-chart>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'pinia';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import client from '../../api/client';
import { buildCategoryBalanceTree } from './categoryBalances';
import PieChart from '../charts/PieChart.vue';
import debounce from 'debounce';
import AddLineItem from './AddLineItem.vue';
import EditAmount from './EditAmount.vue';
import { useCategoryStore } from '../../stores/categoryStore';
import { useTransactionsStore } from '../../stores/transactions/transactionStore';

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
        };
    },
    computed: {
        categories() {
            return buildCategoryBalanceTree(
                this.categoryData,
                this.rawCategories
            );
        },
        flattenedCategories() {
            const result = [];
            const addCategory = (
                category,
                level,
                namePrefix,
                skipTotal = false
            ) => {
                const parentRequired =
                    category.balance !== 0 ||
                    category.budget !== 0 ||
                    category.children.length > 1;
                category.level = level;
                category.name = namePrefix + category.name;
                if (parentRequired) {
                    result.push(category);
                }
                category.children.forEach(child =>
                    addCategory(
                        child,
                        parentRequired ? level + 1 : level,
                        parentRequired ? '' : category.name + ' - '
                    )
                );
                if (category.children.length > 1 && !skipTotal) {
                    result.push({
                        name: 'Total ' + category.name,
                        subtotal: category.subtotal,
                        balance: 0,
                        budget: 0,
                        budgetSubtotal: category.budgetSubtotal,
                        level,
                        total: true,
                    });
                }
            };
            this.categories.forEach(category =>
                addCategory(category, 0, '', this.categories.length === 1)
            );
            return result;
        },
        existingCategoryIds() {
            return Object.keys(this.categoryData).map(
                categoryId => this.categoriesById[categoryId]
            );
        },

        totalBudget() {
            return this.categories.reduce(
                (total, category) => total + category.budgetSubtotal,
                0
            );
        },

        unallocatedBudget() {
            return this.earmark.savingsTarget
                ? this.earmark.savingsTarget - this.totalBudget
                : 0;
        },

        pieChartData() {
            return Object.entries(this.categoryData).map(
                ([categoryId, entry]) => [
                    this.categoriesById[categoryId].name,
                    entry.balance,
                ]
            );
        },

        ...mapState(useCategoryStore, {
            rawCategories: 'categories',
            categoriesById: 'categoriesById',
        }),
        ...mapState(useCategoryStore, ['getCategoryName']),
        ...mapState(useTransactionsStore, ['transactions']),
    },
    created() {
        this.load();
    },
    watch: {
        transactions: {
            handler: debounce(function () {
                this.load();
            }, 250),
            deep: true,
        },
    },
    methods: {
        async load() {
            const [categoryBalanceById, categoryBudgetById] = await Promise.all(
                [
                    client.categoryBalances({
                        earmark: this.earmark.id,
                        transactionType: 'expense',
                    }),
                    client.earmarkBudget(this.earmark.id),
                ]
            );
            const categoryData = {};
            Object.entries(categoryBalanceById).forEach(
                ([categoryId, balance]) =>
                    (categoryData[categoryId] = { balance, budget: 0 })
            );
            Object.entries(categoryBudgetById).forEach(
                ([categoryId, budget]) => {
                    const entry = categoryData[categoryId];
                    if (entry) {
                        entry.budget = budget;
                    } else {
                        categoryData[categoryId] = { balance: 0, budget };
                    }
                }
            );
            this.categoryData = categoryData;
        },
        async updateBudget(categoryId, value) {
            const category = this.categoryData[categoryId];
            const originalBudget = category.budget;
            category.budget = value;
            try {
                await client.setEarmarkBudget(
                    this.earmark.id,
                    categoryId,
                    category.budget
                );
            } catch (error) {
                console.error(error);
                category.budget = originalBudget;
            }
        },
        addCategory(categoryId, budget) {
            this.categoryData[categoryId] = { balance: 0, budget };
        },
    },
    components: {
        MonetaryAmount,
        PieChart,
        AddLineItem,
        EditAmount,
    },
};
</script>

<style lang="scss">
.spending-breakdown {
    border-collapse: collapse;

    td,
    th {
        padding: 4px 12px;
    }

    tfoot td,
    tfoot th {
        padding-top: 10px;
        color: rgba(0, 0, 0, 0.54);
        font-weight: 500;
    }

    tfoot tr {
        border-top: rgba(0, 0, 0, 0.12) solid 3px;
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
