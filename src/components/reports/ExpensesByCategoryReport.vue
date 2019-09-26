<template>
    <v-simple-table>
        <tbody>
            <template v-for="item in reportData">
                <tr class="v-row-group__header">
                    <td class="font-weight-bold">{{ item.name }}</td>
                    <td class="font-weight-bold text-right">
                        <monetary-amount
                            :value="item.totalExpenses"
                        ></monetary-amount>
                    </td>
                </tr>
                <tr v-for="child in item.children">
                    <td>{{ child.name }}</td>
                    <td class="text-right">
                        <monetary-amount
                            :value="child.totalExpenses"
                        ></monetary-amount>
                    </td>
                </tr>
            </template>
        </tbody>
    </v-simple-table>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from "vuex";
import client from "../../api/client";
import store from "../../store/store";
import { formatDate } from "../../api/apiFormats";
import addMonths from "date-fns/addMonths";
import MonetaryAmount from "../util/MonetaryAmount.vue";
import { expenseByCategoryReportData } from "./expenseByCategoryReportData";

export default {
    props: {
        from: { required: true },
        to: { required: true }
    },
    data() {
        return {
            expenseBreakdown: []
        };
    },
    computed: {
        afterDate() {
            return this.previousMonths !== "All"
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
        ...mapGetters("categories", ["getCategoryName"]),
        ...mapState("categories", ["categoriesById"])
    },
    watch: {
        from() {
            this.update();
        },
        to() {
            this.update();
        }
    },
    methods: {
        async update() {
            this.expenseBreakdown = await client.categoryBalances({
                transactionType: "expense",
                from: formatDate(this.from),
                to: formatDate(this.to)
            });
        }
    },
    async mounted() {
        this.update();
    },
    components: {
        MonetaryAmount
    }
};
</script>
