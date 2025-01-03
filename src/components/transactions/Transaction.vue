<template>
    <v-list-item :value="transaction" @click="editTransaction(transaction)">
        <v-list-item-title class="ml-4">{{
            transactionTitle
        }}</v-list-item-title>
        <v-list-item-subtitle class="ml-4">{{
            categoryName
        }}</v-list-item-subtitle>

        <template v-slot:prepend>
            <v-list-item-action>
                <div>
                    <div>{{ dateDay }} {{ dateMonth }}</div>
                    <div class="text-grey text-sm-center text-body-1">
                        {{ dateYear }}
                    </div>
                </div>
            </v-list-item-action>
            <v-chip
                v-if="highlightOverdue"
                label
                :class="{ 'bg-primary text-white ms-4': true, invisible: !due }"
                :aria-hidden="due"
                >Due</v-chip
            >
        </template>
        <template v-slot:append>
            <v-list-item-action>
                <div>
                    <div class="text-right">
                        <monetary-amount
                            :value="transaction.amount"
                        ></monetary-amount>
                    </div>
                    <div class="text-right">
                        <monetary-amount
                            v-if="showBalance"
                            :value="transaction.balance"
                        ></monetary-amount>
                    </div>
                </div>
            </v-list-item-action>
        </template>
    </v-list-item>
</template>

<script>
import { mapState } from 'pinia';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import { parseDate } from '../../api/apiFormats';
import { format as formatDate, isBefore, startOfDay } from 'date-fns';
import { transactionTitle } from './transactionTitle';
import { useRootStore } from '../../stores/root';
import { useAccountsStore } from '../../stores/accountsStore';
import { useEarmarksStore } from '../../stores/earmarksStore';
import { useCategoryStore } from '../../stores/categoryStore';

export default {
    props: {
        transaction: {
            required: true,
        },
        showBalance: {
            type: Boolean,
            default: true,
        },
        highlightOverdue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['selected'],
    computed: {
        transactionTitle() {
            return transactionTitle(
                this.transaction,
                this.accountName,
                this.earmarkName
            );
        },
        categoryName() {
            return this.transaction.categoryId
                ? this.getCategoryName(this.transaction.categoryId)
                : '\xa0';
        },
        selected() {
            return this.transaction === this.selectedTransaction;
        },
        parsedDate() {
            return parseDate(this.transaction.date);
        },
        dateDay() {
            return formatDate(this.parsedDate, 'dd');
        },
        dateMonth() {
            return formatDate(this.parsedDate, 'MMM');
        },
        dateYear() {
            return formatDate(this.parsedDate, 'yyyy');
        },
        due() {
            return (
                this.highlightOverdue &&
                isBefore(startOfDay(this.parsedDate), new Date())
            );
        },
        ...mapState(useRootStore, ['selectedTransaction']),
        ...mapState(useCategoryStore, ['getCategoryName']),
        ...mapState(useAccountsStore, ['accountName']),
        ...mapState(useEarmarksStore, ['earmarkName']),
    },

    methods: {
        editTransaction(transaction) {
            this.$emit('selected', transaction);
        },
    },

    components: {
        MonetaryAmount,
    },
};
</script>

<style lang="scss" scoped>
.invisible {
    visibility: hidden !important;
}
</style>
