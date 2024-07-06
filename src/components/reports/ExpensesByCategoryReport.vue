<template>
    <v-table>
        <tbody v-if="loading">
            <tr>
                <td
                    colspan="2"
                    class="progress-cell pa-0 ma-0"
                    style="height: auto"
                >
                    <v-progress-linear indeterminate></v-progress-linear>
                </td>
            </tr>
        </tbody>
        <tbody>
            <template v-for="item in reportData" :key="item.categoryId">
                <tr class="v-row-group__header">
                    <td class="font-weight-bold">{{ item.name }}</td>
                    <td class="font-weight-bold text-right">
                        <monetary-amount
                            :value="item.totalExpenses"
                        ></monetary-amount>
                    </td>
                </tr>
                <tr v-for="child in item.children" :key="child.categoryId">
                    <td>
                        <router-link
                            :to="{
                                path: '/transactions/',
                                query: {
                                    from,
                                    to,
                                    category: [child.categoryId],
                                },
                            }"
                            >{{ child.name }}</router-link
                        >
                    </td>
                    <td class="text-right">
                        <monetary-amount
                            :value="child.totalExpenses"
                        ></monetary-amount>
                    </td>
                </tr>
            </template>
        </tbody>
    </v-table>
</template>

<script>
import { mapState } from 'pinia';
import client from '../../api/client';
import { formatDate } from '../../api/apiFormats';
import { addMonths } from 'date-fns';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import { expenseByCategoryReportData } from './expenseByCategoryReportData';
import { useCategoryStore } from '../../stores/categoryStore';

export default {
    props: {
        from: { required: true },
        to: { required: true },
    },
    data() {
        return {
            expenseBreakdown: [],
            loading: true,
        };
    },
    computed: {
        afterDate() {
            return this.previousMonths !== 'All'
                ? formatDate(addMonths(new Date(), -this.previousMonths))
                : undefined;
        },
        reportData() {
            return expenseByCategoryReportData(
                this.expenseBreakdown,
                this.categoriesById,
                this.getCategoryName
            );
        },
        ...mapState(useCategoryStore, ['categoriesById', 'getCategoryName']),
    },
    watch: {
        from() {
            this.update();
        },
        to() {
            this.update();
        },
    },
    async mounted() {
        this.update();
    },
    methods: {
        async update() {
            this.loading = true;
            try {
                this.expenseBreakdown = await client.categoryBalances({
                    transactionType: 'expense',
                    from: formatDate(this.from),
                    to: formatDate(this.to),
                });
            } finally {
                this.loading = false;
            }
        },
    },
    components: {
        MonetaryAmount,
    },
};
</script>

<style lang="scss">
.progress-cell {
    height: auto;
}
</style>
